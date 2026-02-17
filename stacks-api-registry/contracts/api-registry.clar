;; API Registry Smart Contract
;; Manages API configurations with CRUD operations

;; Data structure for API configuration
(define-map api-configs
  { api-name: (string-ascii 100) }
  {
    allowed-agents: (string-utf8 500),
    cooldown-blocks: uint,
    verify-agent: bool,
    owner: principal
  }
)

;; Counter for total APIs
(define-data-var api-count uint u0)

;; Error constants
(define-constant err-not-found (err u404))
(define-constant err-unauthorized (err u403))
(define-constant err-already-exists (err u409))

;; Create new API configuration
(define-public (create-api 
  (api-name (string-ascii 100))
  (allowed-agents (string-utf8 500))
  (cooldown-blocks uint)
  (verify-agent bool))
  (let ((existing (map-get? api-configs { api-name: api-name })))
    (if (is-some existing)
      err-already-exists
      (begin
        (map-set api-configs
          { api-name: api-name }
          {
            allowed-agents: allowed-agents,
            cooldown-blocks: cooldown-blocks,
            verify-agent: verify-agent,
            owner: tx-sender
          }
        )
        (var-set api-count (+ (var-get api-count) u1))
        (ok true)
      )
    )
  )
)

;; Read API configuration
(define-read-only (get-api (api-name (string-ascii 100)))
  (match (map-get? api-configs { api-name: api-name })
    config (ok config)
    err-not-found
  )
)

;; Update API configuration
(define-public (update-api
  (api-name (string-ascii 100))
  (allowed-agents (string-utf8 500))
  (cooldown-blocks uint)
  (verify-agent bool))
  (let ((existing (map-get? api-configs { api-name: api-name })))
    (match existing
      config
        (if (is-eq (get owner config) tx-sender)
          (begin
            (map-set api-configs
              { api-name: api-name }
              {
                allowed-agents: allowed-agents,
                cooldown-blocks: cooldown-blocks,
                verify-agent: verify-agent,
                owner: tx-sender
              }
            )
            (ok true)
          )
          err-unauthorized
        )
      err-not-found
    )
  )
)

;; Delete API configuration
(define-public (delete-api (api-name (string-ascii 100)))
  (let ((existing (map-get? api-configs { api-name: api-name })))
    (match existing
      config
        (if (is-eq (get owner config) tx-sender)
          (begin
            (map-delete api-configs { api-name: api-name })
            (var-set api-count (- (var-get api-count) u1))
            (ok true)
          )
          err-unauthorized
        )
      err-not-found
    )
  )
)

;; Get total API count
(define-read-only (get-api-count)
  (ok (var-get api-count))
)
