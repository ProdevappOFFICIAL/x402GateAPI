import { 
  PublicKey, 
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferCheckedInstruction
} from '@solana/spl-token';
import { 
  encodeURL,
  findReference,
  validateTransfer
} from '@solana/pay';
import BigNumber from 'bignumber.js';
import { connection, SUPPORTED_TOKENS } from '../configs/solana';

export interface PaymentRequest {
  recipient: PublicKey;
  amount: BigNumber;
  splToken?: PublicKey;
  reference: PublicKey;
  label: string;
  message: string;
  memo?: string;
}

export interface PaymentStatus {
  confirmed: boolean;
  signature?: string;
  amount?: number;
  timestamp?: Date;
}

/**
 * Create a Solana Pay URL for payment request
 */
export const createPaymentURL = (paymentRequest: PaymentRequest): string => {
  const urlFields = {
    recipient: paymentRequest.recipient,
    amount: paymentRequest.amount,
    reference: paymentRequest.reference,
    label: paymentRequest.label,
    message: paymentRequest.message,
    ...(paymentRequest.splToken && { splToken: paymentRequest.splToken }),
    ...(paymentRequest.memo && { memo: paymentRequest.memo })
  };

  const url = encodeURL(urlFields);
  return url.toString();
};

/**
 * Create a payment transaction for SOL
 */
export const createSOLPaymentTransaction = async (
  payer: PublicKey,
  recipient: PublicKey,
  amount: BigNumber,
  reference: PublicKey,
  memo?: string
): Promise<Transaction> => {
  const transaction = new Transaction();

  // Add SOL transfer instruction
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: recipient,
    lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
  });

  transaction.add(transferInstruction);

  // Add reference as a key to the instruction for tracking
  transferInstruction.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  });

  // Add memo if provided
  if (memo) {
    const memoInstruction = {
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from(memo, 'utf8'),
    };
    transaction.add(memoInstruction);
  }

  return transaction;
};

/**
 * Create a payment transaction for SPL tokens
 */
export const createSPLPaymentTransaction = async (
  payer: PublicKey,
  recipient: PublicKey,
  amount: BigNumber,
  splToken: PublicKey,
  decimals: number,
  reference: PublicKey,
  memo?: string
): Promise<Transaction> => {
  const transaction = new Transaction();

  // Get associated token addresses
  const payerTokenAddress = await getAssociatedTokenAddress(
    splToken,
    payer,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const recipientTokenAddress = await getAssociatedTokenAddress(
    splToken,
    recipient,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Add SPL token transfer instruction
  const transferInstruction = createTransferCheckedInstruction(
    payerTokenAddress,
    splToken,
    recipientTokenAddress,
    payer,
    amount.multipliedBy(10 ** decimals).toNumber(),
    decimals,
    [],
    TOKEN_PROGRAM_ID
  );

  // Add reference as a key to the instruction for tracking
  transferInstruction.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  });

  transaction.add(transferInstruction);

  // Add memo if provided
  if (memo) {
    const memoInstruction = {
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from(memo, 'utf8'),
    };
    transaction.add(memoInstruction);
  }

  return transaction;
};

/**
 * Verify payment using Solana Pay's built-in verification
 */
export const verifyPayment = async (
  reference: PublicKey,
  expectedAmount: BigNumber,
  recipient: PublicKey,
  splToken?: PublicKey
): Promise<PaymentStatus> => {
  try {
    // Use Solana Pay's findReference to locate the transaction
    const signatureInfo = await findReference(connection, reference, {
      finality: 'confirmed'
    });

    if (!signatureInfo) {
      return { confirmed: false };
    }

    // Validate the transfer using Solana Pay's validateTransfer
    await validateTransfer(
      connection,
      signatureInfo.signature,
      {
        recipient,
        amount: expectedAmount,
        ...(splToken && { splToken })
      },
      { commitment: 'confirmed' }
    );

    // Get transaction details for additional info
    const transaction = await connection.getTransaction(signatureInfo.signature, {
      maxSupportedTransactionVersion: 0
    });

    let actualAmount = expectedAmount.toNumber();
    let timestamp = new Date();

    if (transaction?.blockTime) {
      timestamp = new Date(transaction.blockTime * 1000);
    }

    // Extract actual amount from transaction if possible
    if (transaction?.meta && !transaction.meta.err) {
      if (splToken) {
        // For SPL tokens, check token balance changes
        const tokenBalances = transaction.meta.postTokenBalances || [];
        const recipientTokenBalance = tokenBalances.find(
          balance => balance.owner === recipient.toString() && balance.mint === splToken.toString()
        );
        if (recipientTokenBalance) {
          const tokenInfo = Object.values(SUPPORTED_TOKENS).find(
            token => token.mint === splToken.toString()
          );
          if (tokenInfo) {
            actualAmount = Number(recipientTokenBalance.uiTokenAmount.uiAmount) || actualAmount;
          }
        }
      } else {
        // For SOL, check balance changes
        const accountIndex = transaction.transaction.message.staticAccountKeys.findIndex(
          key => key.toString() === recipient.toString()
        );
        if (accountIndex !== -1 && transaction.meta.preBalances && transaction.meta.postBalances) {
          const balanceChange = transaction.meta.postBalances[accountIndex] - transaction.meta.preBalances[accountIndex];
          actualAmount = balanceChange / LAMPORTS_PER_SOL;
        }
      }
    }

    return {
      confirmed: true,
      signature: signatureInfo.signature,
      amount: actualAmount,
      timestamp
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return { confirmed: false };
  }
};

/**
 * Create a simple payment request (alternative to full PaymentRequest)
 */
export const createSimplePaymentURL = (
  recipient: PublicKey,
  amount: number,
  reference: PublicKey,
  label: string,
  message: string,
  splToken?: PublicKey
): string => {
  const urlFields = {
    recipient,
    amount: new BigNumber(amount),
    reference,
    label,
    message,
    ...(splToken && { splToken })
  };

  const url = encodeURL(urlFields);
  return url.toString();
};

/**
 * Generate a unique reference key for payment tracking
 */
export const generateReference = (): PublicKey => {
  return PublicKey.unique();
};

/**
 * Convert currency amount to BigNumber
 */
export const toBigNumber = (amount: string | number): BigNumber => {
  return new BigNumber(amount);
};/**
 * Fin
d and verify payment transaction (similar to your example)
 */
export const findAndVerifyPayment = async (
  reference: PublicKey,
  recipient: PublicKey,
  expectedAmount?: BigNumber
): Promise<{ success: boolean; txSignature?: string; message?: string }> => {
  try {
    // Find the transaction using the reference
    const signatureInfo = await findReference(connection, reference, { 
      finality: 'confirmed' 
    });

    // Validate the transfer
    const validateFields: any = { recipient };
    if (expectedAmount) {
      validateFields.amount = expectedAmount;
    }
    
    await validateTransfer(
      connection,
      signatureInfo.signature,
      validateFields
    );

    return {
      success: true,
      txSignature: signatureInfo.signature
    };
  } catch (error) {
    console.error('Payment verification failed:', error);
    return {
      success: false,
      message: 'Payment not yet confirmed'
    };
  }
};