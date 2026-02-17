{
  "limit": 50,
  "offset": 0,
  "total": 8,
  "results": [
    {
      "tx_id": "0xa4380d893019185efc652d52be08610bdc9fc0467a4d03347d0fcaeafdf76b2e",
      "nonce": 26,
      "fee_rate": "3000",
      "sender_address": "ST1WNVWY7WCJESTHM050RAMRRE44KJTKZKJCSRFCQ",
      "sponsored": false,
      "post_condition_mode": "allow",
      "post_conditions": [],
      "anchor_mode": "any",
      "block_hash": "0xa26864841759a01110d700cb0a2f1dfe4420fb9a033a4c91ab455c383c9eabda",
      "block_height": 3791722,
      "block_time": 1771134315,
      "block_time_iso": "2026-02-15T05:45:15.000Z",
      "burn_block_time": 1771134155,
      "burn_block_height": 145591,
      "burn_block_time_iso": "2026-02-15T05:42:35.000Z",
      "parent_burn_block_time": 1771134155,
      "parent_burn_block_time_iso": "2026-02-15T05:42:35.000Z",
      "canonical": true,
      "tx_index": 0,
      "tx_status": "success",
      "tx_result": {
        "hex": "0x0703",
        "repr": "(ok true)"
      },
      "event_count": 0,
      "parent_block_hash": "0x0b6f1e15cf4a59a6375fca356265d41746da6bc2068dd191585dc9b89f4c6a6f",
      "is_unanchored": false,
      "microblock_hash": "0x",
      "microblock_sequence": 2147483647,
      "microblock_canonical": true,
      "execution_cost_read_count": 5,
      "execution_cost_read_length": 2846,
      "execution_cost_runtime": 25217,
      "execution_cost_write_count": 1,
      "execution_cost_write_length": 138,
      "vm_error": null,
      "events": [],
      "tx_type": "contract_call",
      "contract_call": {
        "contract_id": "ST3AW560S3EET4NNSC3NG9N6CPNMPGASTMKWX11KG.api-registry",
        "function_name": "update-api",
        "function_signature": "(define-public (update-api (api-name (string-ascii 100)) (allowed-agents (string-utf8 500)) (cooldown-blocks uint) (verify-agent bool)))",
        "function_args": [
          {
            "hex": "0x0d000000066f67756e747a",
            "repr": "\"oguntz\"",
            "name": "api-name",
            "type": "(string-ascii 100)"
          },
          {
            "hex": "0x0e0000000b6468686464686468686564",
            "repr": "u\"dhhddhdhhed\"",
            "name": "allowed-agents",
            "type": "(string-utf8 500)"
          },
          {
            "hex": "0x010000000000000000000000000000000a",
            "repr": "u10",
            "name": "cooldown-blocks",
            "type": "uint"
          },
          {
            "hex": "0x03",
            "repr": "true",
            "name": "verify-agent",
            "type": "bool"
          }
        ]
      }
    },
    {
      "tx_id": "0xc8b7104abf023bbcbed4860e9a0944dfac3f8b630cd365a32b4cf994f11097ca",
      "nonce": 25,
      "fee_rate": "3000",
      "sender_address": "ST1WNVWY7WCJESTHM050RAMRRE44KJTKZKJCSRFCQ",
      "sponsored": false,
      "post_condition_mode": "allow",
      "post_conditions": [],
      "anchor_mode": "any",
      "block_hash": "0x65f77f47c0532a863c7cbf8b0116202f461f756a5e8e30be1b959af872355e8f",
      "block_height": 3791711,
      "block_time": 1771133689,
      "block_time_iso": "2026-02-15T05:34:49.000Z",
      "burn_block_time": 1771133650,
      "burn_block_height": 145589,
      "burn_block_time_iso": "2026-02-15T05:34:10.000Z",
      "parent_burn_block_time": 1771133650,
      "parent_burn_block_time_iso": "2026-02-15T05:34:10.000Z",
      "canonical": true,
      "tx_index": 0,
      "tx_status": "success",
      "tx_result": {
        "hex": "0x0703",
        "repr": "(ok true)"
      },
      "event_count": 0,
      "parent_block_hash": "0xc16a37ce34134b307a645e2b4a95c519e65c3e355c1f29c925f84713d8bebef5",
      "is_unanchored": false,
      "microblock_hash": "0x",
      "microblock_sequence": 2147483647,
      "microblock_canonical": true,
      "execution_cost_read_count": 5,
      "execution_cost_read_length": 2843,
      "execution_cost_runtime": 25134,
      "execution_cost_write_count": 1,
      "execution_cost_write_length": 134,
      "vm_error": null,
      "events": [],
      "tx_type": "contract_call",
      "contract_call": {
        "contract_id": "ST3AW560S3EET4NNSC3NG9N6CPNMPGASTMKWX11KG.api-registry",
        "function_name": "update-api",
        "function_signature": "(define-public (update-api (api-name (string-ascii 100)) (allowed-agents (string-utf8 500)) (cooldown-blocks uint) (verify-agent bool)))",
        "function_args": [
          {
            "hex": "0x0d000000066f67756e747a",
            "repr": "\"oguntz\"",
            "name": "api-name",
            "type": "(string-ascii 100)"
          },
          {
            "hex": "0x0e0000000764686864646864",
            "repr": "u\"dhhddhd\"",
            "name": "allowed-agents",
            "type": "(string-utf8 500)"
          },
          {
            "hex": "0x010000000000000000000000000000000a",
            "repr": "u10",
            "name": "cooldown-blocks",
            "type": "uint"
          },
          {
            "hex": "0x03",
            "repr": "true",
            "name": "verify-agent",
            "type": "bool"
          }
        ]
      }
    },
    {
      "tx_id": "0x5f625234bfa127b7d2b188d53ccd6a589b64656287ab2de21da71279f6213416",
      "nonce": 24,
      "fee_rate": "3000",
      "sender_address": "ST1WNVWY7WCJESTHM050RAMRRE44KJTKZKJCSRFCQ",
      "sponsored": false,
      "post_condition_mode": "allow",
      "post_conditions": [],
      "anchor_mode": "any",
      "block_hash": "0xc025dd946786dc29886cdfcd92401485b37d23e590da14a3e01b2321dad273ab",
      "block_height": 3791705,
      "block_time": 1771133587,
      "block_time_iso": "2026-02-15T05:33:07.000Z",
      "burn_block_time": 1771133451,
      "burn_block_height": 145588,
      "burn_block_time_iso": "2026-02-15T05:30:51.000Z",
      "parent_burn_block_time": 1771133451,
      "parent_burn_block_time_iso": "2026-02-15T05:30:51.000Z",
      "canonical": true,
      "tx_index": 0,
      "tx_status": "success",
      "tx_result": {
        "hex": "0x0703",
        "repr": "(ok true)"
      },
      "event_count": 0,
      "parent_block_hash": "0x06e1fddba70f7f42885f8cb850513ac51c6d1fdb5937a8e1bbd9455a40163f28",
      "is_unanchored": false,
      "microblock_hash": "0x",
      "microblock_sequence": 2147483647,
      "microblock_canonical": true,
      "execution_cost_read_count": 7,
      "execution_cost_read_length": 2756,
      "execution_cost_runtime": 14915,
      "execution_cost_write_count": 2,
      "execution_cost_write_length": 149,
      "vm_error": null,
      "events": [],
      "tx_type": "contract_call",
      "contract_call": {
        "contract_id": "ST3AW560S3EET4NNSC3NG9N6CPNMPGASTMKWX11KG.api-registry",
        "function_name": "create-api",
        "function_signature": "(define-public (create-api (api-name (string-ascii 100)) (allowed-agents (string-utf8 500)) (cooldown-blocks uint) (verify-agent bool)))",
        "function_args": [
          {
            "hex": "0x0d000000066f67756e747a",
            "repr": "\"oguntz\"",
            "name": "api-name",
            "type": "(string-ascii 100)"
          },
          {
            "hex": "0x0e0000000464686864",
            "repr": "u\"dhhd\"",
            "name": "allowed-agents",
            "type": "(string-utf8 500)"
          },
          {
            "hex": "0x010000000000000000000000000000000a",
            "repr": "u10",
            "name": "cooldown-blocks",
            "type": "uint"
          },
          {
            "hex": "0x03",
            "repr": "true",
            "name": "verify-agent",
            "type": "bool"
          }
        ]
      }
    },
    {
      "tx_id": "0xa68229f8c7c2d95f0ad90debe13c09966616f324ce13713bfafae3a0701adfe9",
      "nonce": 23,
      "fee_rate": "3502",
      "sender_address": "ST1WNVWY7WCJESTHM050RAMRRE44KJTKZKJCSRFCQ",
      "sponsored": false,
      "post_condition_mode": "allow",
      "post_conditions": [],
      "anchor_mode": "any",
      "block_hash": "0x38830e0a9d70189c72aa4a051b6e4798b914ff66d410114bba58cb371117dde6",
      "block_height": 3791699,
      "block_time": 1771133234,
      "block_time_iso": "2026-02-15T05:27:14.000Z",
      "burn_block_time": 1771133184,
      "burn_block_height": 145587,
      "burn_block_time_iso": "2026-02-15T05:26:24.000Z",
      "parent_burn_block_time": 1771133184,
      "parent_burn_block_time_iso": "2026-02-15T05:26:24.000Z",
      "canonical": true,
      "tx_index": 0,
      "tx_status": "success",
      "tx_result": {
        "hex": "0x0703",
        "repr": "(ok true)"
      },
      "event_count": 0,
      "parent_block_hash": "0xf5ea10bac9b8408ac8eb5418e01c9ac6afbb796488aade24ff34056cc4b75c13",
      "is_unanchored": false,
      "microblock_hash": "0x",
      "microblock_sequence": 2147483647,
      "microblock_canonical": true,
      "execution_cost_read_count": 7,
      "execution_cost_read_length": 2753,
      "execution_cost_runtime": 14882,
      "execution_cost_write_count": 2,
      "execution_cost_write_length": 146,
      "vm_error": null,
      "events": [],
      "tx_type": "contract_call",
      "contract_call": {
        "contract_id": "ST3AW560S3EET4NNSC3NG9N6CPNMPGASTMKWX11KG.api-registry",
        "function_name": "create-api",
        "function_signature": "(define-public (create-api (api-name (string-ascii 100)) (allowed-agents (string-utf8 500)) (cooldown-blocks uint) (verify-agent bool)))",
        "function_args": [
          {
            "hex": "0x0d000000036e6577",
            "repr": "\"new\"",
            "name": "api-name",
            "type": "(string-ascii 100)"
          },
          {
            "hex": "0x0e00000004646a646a",
            "repr": "u\"djdj\"",
            "name": "allowed-agents",
            "type": "(string-utf8 500)"
          },
          {
            "hex": "0x010000000000000000000000000000000a",
            "repr": "u10",
            "name": "cooldown-blocks",
            "type": "uint"
          },
          {
            "hex": "0x03",
            "repr": "true",
            "name": "verify-agent",
            "type": "bool"
          }
        ]
      }
    },
    {
      "tx_id": "0xe79922197d49ad78a808e07006c5b8b97d9ef6c242812cfe3e0bf84d3f7f1a7c",
      "nonce": 22,
      "fee_rate": "3000",
      "sender_address": "ST1WNVWY7WCJESTHM050RAMRRE44KJTKZKJCSRFCQ",
      "sponsored": false,
      "post_condition_mode": "allow",
      "post_conditions": [],
      "anchor_mode": "any",
      "block_hash": "0xba6fc8fb15c163a75ab686839b5744cadfc216a3b90df374bf6cbeddba092ae5",
      "block_height": 3791694,
      "block_time": 1771132959,
      "block_time_iso": "2026-02-15T05:22:39.000Z",
      "burn_block_time": 1771132933,
      "burn_block_height": 145586,
      "burn_block_time_iso": "2026-02-15T05:22:13.000Z",
      "parent_burn_block_time": 1771132933,
      "parent_burn_block_time_iso": "2026-02-15T05:22:13.000Z",
      "canonical": true,
      "tx_index": 0,
      "tx_status": "success",
      "tx_result": {
        "hex": "0x0703",
        "repr": "(ok true)"
      },
      "event_count": 0,
      "parent_block_hash": "0x4916e6aea96e51becfbf3721d7dbeaadd8a0e63c09f6ee68c7aad0ee923cee23",
      "is_unanchored": false,
      "microblock_hash": "0x",
      "microblock_sequence": 2147483647,
      "microblock_canonical": true,
      "execution_cost_read_count": 7,
      "execution_cost_read_length": 2758,
      "execution_cost_runtime": 15677,
      "execution_cost_write_count": 2,
      "execution_cost_write_length": 188,
      "vm_error": null,
      "events": [],
      "tx_type": "contract_call",
      "contract_call": {
        "contract_id": "ST3AW560S3EET4NNSC3NG9N6CPNMPGASTMKWX11KG.api-registry",
        "function_name": "create-api",
        "function_signature": "(define-public (create-api (api-name (string-ascii 100)) (allowed-agents (string-utf8 500)) (cooldown-blocks uint) (verify-agent bool)))",
        "function_args": [
          {
            "hex": "0x0d0000000850727564656e6365",
            "repr": "\"Prudence\"",
            "name": "api-name",
            "type": "(string-ascii 100)"
          },
          {
            "hex": "0x0e00000029535433334b56514736385939373337424d5443364a395059344758433244354b304747363347485432",
            "repr": "u\"ST33KVQG68Y9737BMTC6J9PY4GXC2D5K0GG63GHT2\"",
            "name": "allowed-agents",
            "type": "(string-utf8 500)"
          },
          {
            "hex": "0x010000000000000000000000000000000a",
            "repr": "u10",
            "name": "cooldown-blocks",
            "type": "uint"
          },
          {
            "hex": "0x03",
            "repr": "true",
            "name": "verify-agent",
            "type": "bool"
          }
        ]
      }
    },
    {
      "tx_id": "0x8e509adfaaa742b53d13fbc021befcfb5c78f1c74accfa9e2f0583bccf281a43",
      "nonce": 21,
      "fee_rate": "3000",
      "sender_address": "ST1WNVWY7WCJESTHM050RAMRRE44KJTKZKJCSRFCQ",
      "sponsored": false,
      "post_condition_mode": "allow",
      "post_conditions": [],
      "anchor_mode": "any",
      "block_hash": "0x88452b6a3b82b3d6615ed29235cf7a59108f81149426c1019a2bbea2bc2171b0",
      "block_height": 3791682,
      "block_time": 1771132419,
      "block_time_iso": "2026-02-15T05:13:39.000Z",
      "burn_block_time": 1771132170,
      "burn_block_height": 145583,
      "burn_block_time_iso": "2026-02-15T05:09:30.000Z",
      "parent_burn_block_time": 1771132170,
      "parent_burn_block_time_iso": "2026-02-15T05:09:30.000Z",
      "canonical": true,
      "tx_index": 0,
      "tx_status": "success",
      "tx_result": {
        "hex": "0x0703",
        "repr": "(ok true)"
      },
      "event_count": 0,
      "parent_block_hash": "0x3e087075cf46b5815aa258eed33a80c43c03c8b55fcae3589cafb8fb555b0d53",
      "is_unanchored": false,
      "microblock_hash": "0x",
      "microblock_sequence": 2147483647,
      "microblock_canonical": true,
      "execution_cost_read_count": 7,
      "execution_cost_read_length": 2754,
      "execution_cost_runtime": 15633,
      "execution_cost_write_count": 2,
      "execution_cost_write_length": 184,
      "vm_error": null,
      "events": [],
      "tx_type": "contract_call",
      "contract_call": {
        "contract_id": "ST3AW560S3EET4NNSC3NG9N6CPNMPGASTMKWX11KG.api-registry",
        "function_name": "create-api",
        "function_signature": "(define-public (create-api (api-name (string-ascii 100)) (allowed-agents (string-utf8 500)) (cooldown-blocks uint) (verify-agent bool)))",
        "function_args": [
          {
            "hex": "0x0d000000046e657777",
            "repr": "\"neww\"",
            "name": "api-name",
            "type": "(string-ascii 100)"
          },
          {
            "hex": "0x0e00000029535433334b56514736385939373337424d5443364a395059344758433244354b304747363347485432",
            "repr": "u\"ST33KVQG68Y9737BMTC6J9PY4GXC2D5K0GG63GHT2\"",
            "name": "allowed-agents",
            "type": "(string-utf8 500)"
          },
          {
            "hex": "0x010000000000000000000000000000000a",
            "repr": "u10",
            "name": "cooldown-blocks",
            "type": "uint"
          },
          {
            "hex": "0x03",
            "repr": "true",
            "name": "verify-agent",
            "type": "bool"
          }
        ]
      }
    },
    {
      "tx_id": "0x8f94dfcf38aa26c4a71f972103184bffce050d3e7642aa4ab39d3b71f85ae8f1",
      "nonce": 20,
      "fee_rate": "3000",
      "sender_address": "ST1WNVWY7WCJESTHM050RAMRRE44KJTKZKJCSRFCQ",
      "sponsored": false,
      "post_condition_mode": "allow",
      "post_conditions": [],
      "anchor_mode": "any",
      "block_hash": "0x288b35ad19f5e36b5d0c0f224320107d69b96f2bde1349d5fd5c7a000822faf2",
      "block_height": 3791677,
      "block_time": 1771131973,
      "block_time_iso": "2026-02-15T05:06:13.000Z",
      "burn_block_time": 1771131931,
      "burn_block_height": 145582,
      "burn_block_time_iso": "2026-02-15T05:05:31.000Z",
      "parent_burn_block_time": 1771131931,
      "parent_burn_block_time_iso": "2026-02-15T05:05:31.000Z",
      "canonical": true,
      "tx_index": 0,
      "tx_status": "success",
      "tx_result": {
        "hex": "0x0703",
        "repr": "(ok true)"
      },
      "event_count": 0,
      "parent_block_hash": "0xeca1a96efd10dced02d3dc53889d9e547e7fd91841dd8afa4bbf8a18915d88a4",
      "is_unanchored": false,
      "microblock_hash": "0x",
      "microblock_sequence": 2147483647,
      "microblock_canonical": true,
      "execution_cost_read_count": 7,
      "execution_cost_read_length": 2754,
      "execution_cost_runtime": 15633,
      "execution_cost_write_count": 2,
      "execution_cost_write_length": 184,
      "vm_error": null,
      "events": [],
      "tx_type": "contract_call",
      "contract_call": {
        "contract_id": "ST3AW560S3EET4NNSC3NG9N6CPNMPGASTMKWX11KG.api-registry",
        "function_name": "create-api",
        "function_signature": "(define-public (create-api (api-name (string-ascii 100)) (allowed-agents (string-utf8 500)) (cooldown-blocks uint) (verify-agent bool)))",
        "function_args": [
          {
            "hex": "0x0d000000046e616d65",
            "repr": "\"name\"",
            "name": "api-name",
            "type": "(string-ascii 100)"
          },
          {
            "hex": "0x0e00000029535433334b56514736385939373337424d5443364a395059344758433244354b304747363347485432",
            "repr": "u\"ST33KVQG68Y9737BMTC6J9PY4GXC2D5K0GG63GHT2\"",
            "name": "allowed-agents",
            "type": "(string-utf8 500)"
          },
          {
            "hex": "0x010000000000000000000000000000000a",
            "repr": "u10",
            "name": "cooldown-blocks",
            "type": "uint"
          },
          {
            "hex": "0x03",
            "repr": "true",
            "name": "verify-agent",
            "type": "bool"
          }
        ]
      }
    },
    {
      "tx_id": "0xbbcefbf053b03798f2d23f591df2ce00532d93f2e06c79e9854ccfdd18b44491",
      "nonce": 0,
      "fee_rate": "509487",
      "sender_address": "ST3AW560S3EET4NNSC3NG9N6CPNMPGASTMKWX11KG",
      "sponsored": false,
      "post_condition_mode": "allow",
      "post_conditions": [],
      "anchor_mode": "on_chain_only",
      "block_hash": "0xaeacef16638101871261b4e63f6c906ebc022f52fc023858968b5bb360f85b93",
      "block_height": 3791612,
      "block_time": 1771128996,
      "block_time_iso": "2026-02-15T04:16:36.000Z",
      "burn_block_time": 1771128829,
      "burn_block_height": 145569,
      "burn_block_time_iso": "2026-02-15T04:13:49.000Z",
      "parent_burn_block_time": 1771128829,
      "parent_burn_block_time_iso": "2026-02-15T04:13:49.000Z",
      "canonical": true,
      "tx_index": 0,
      "tx_status": "success",
      "tx_result": {
        "hex": "0x0703",
        "repr": "(ok true)"
      },
      "event_count": 0,
      "parent_block_hash": "0x091af41322967cd33963da87d17770ddb9737b8bfe1ec8e5c7b020b550b32a9a",
      "is_unanchored": false,
      "microblock_hash": "0x",
      "microblock_sequence": 2147483647,
      "microblock_canonical": true,
      "execution_cost_read_count": 1,
      "execution_cost_read_length": 1,
      "execution_cost_runtime": 162049,
      "execution_cost_write_count": 5,
      "execution_cost_write_length": 5385,
      "vm_error": null,
      "events": [],
      "tx_type": "smart_contract",
      "smart_contract": {
        "clarity_version": null,
        "contract_id": "ST3AW560S3EET4NNSC3NG9N6CPNMPGASTMKWX11KG.api-registry",
        "source_code": ";; API Registry Smart Contract\n;; Manages API configurations with CRUD operations\n\n;; Data structure for API configuration\n(define-map api-configs\n  { api-name: (string-ascii 100) }\n  {\n    allowed-agents: (string-utf8 500),\n    cooldown-blocks: uint,\n    verify-agent: bool,\n    owner: principal\n  }\n)\n\n;; Counter for total APIs\n(define-data-var api-count uint u0)\n\n;; Error constants\n(define-constant err-not-found (err u404))\n(define-constant err-unauthorized (err u403))\n(define-constant err-already-exists (err u409))\n\n;; Create new API configuration\n(define-public (create-api \n  (api-name (string-ascii 100))\n  (allowed-agents (string-utf8 500))\n  (cooldown-blocks uint)\n  (verify-agent bool))\n  (let ((existing (map-get? api-configs { api-name: api-name })))\n    (if (is-some existing)\n      err-already-exists\n      (begin\n        (map-set api-configs\n          { api-name: api-name }\n          {\n            allowed-agents: allowed-agents,\n            cooldown-blocks: cooldown-blocks,\n            verify-agent: verify-agent,\n            owner: tx-sender\n          }\n        )\n        (var-set api-count (+ (var-get api-count) u1))\n        (ok true)\n      )\n    )\n  )\n)\n\n;; Read API configuration\n(define-read-only (get-api (api-name (string-ascii 100)))\n  (match (map-get? api-configs { api-name: api-name })\n    config (ok config)\n    err-not-found\n  )\n)\n\n;; Update API configuration\n(define-public (update-api\n  (api-name (string-ascii 100))\n  (allowed-agents (string-utf8 500))\n  (cooldown-blocks uint)\n  (verify-agent bool))\n  (let ((existing (map-get? api-configs { api-name: api-name })))\n    (match existing\n      config\n        (if (is-eq (get owner config) tx-sender)\n          (begin\n            (map-set api-configs\n              { api-name: api-name }\n              {\n                allowed-agents: allowed-agents,\n                cooldown-blocks: cooldown-blocks,\n                verify-agent: verify-agent,\n                owner: tx-sender\n              }\n            )\n            (ok true)\n          )\n          err-unauthorized\n        )\n      err-not-found\n    )\n  )\n)\n\n;; Delete API configuration\n(define-public (delete-api (api-name (string-ascii 100)))\n  (let ((existing (map-get? api-configs { api-name: api-name })))\n    (match existing\n      config\n        (if (is-eq (get owner config) tx-sender)\n          (begin\n            (map-delete api-configs { api-name: api-name })\n            (var-set api-count (- (var-get api-count) u1))\n            (ok true)\n          )\n          err-unauthorized\n        )\n      err-not-found\n    )\n  )\n)\n\n;; Get total API count\n(define-read-only (get-api-count)\n  (ok (var-get api-count))\n)\n"
      }
    }
  ]
}