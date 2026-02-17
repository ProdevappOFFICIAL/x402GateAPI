;; API Registry Smart Contract V2
;; Manages API configurations with CRUD operations and list functionality

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

;; List to track all API names (for iteration)
(define-data-var api-names (list 100 (string-ascii 100)) (list))

;; Counter for total APIs
(define-data-var api-count uint u0)

;; Error constants
(define-constant err-not-found (err u404))
(define-constant err-unauthorized (err u403))
(define-constant err-already-exists (err u409))
(define-constant err-list-full (err u410))

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
        ;; Add to list of API names
        (match (as-max-len? (append (var-get api-names) api-name) u100)
          new-list (var-set api-names new-list)
          err-list-full
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

;; Get all API names
(define-read-only (get-all-api-names)
  (ok (var-get api-names))
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
            ;; Remove from list (filter out the deleted name)
            (var-set api-names (filter is-not-deleted-api (var-get api-names)))
            (var-set api-count (- (var-get api-count) u1))
            (ok true)
          )
          err-unauthorized
        )
      err-not-found
    )
  )
)

;; Helper function for filtering
(define-private (is-not-deleted-api (name (string-ascii 100)))
  (is-some (map-get? api-configs { api-name: name }))
)

;; Get total API count
(define-read-only (get-api-count)
  (ok (var-get api-count))
)
