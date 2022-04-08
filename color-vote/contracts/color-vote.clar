(define-constant ERR_BAD_REQUEST (err u400))
(define-constant ERR_FORBIDDEN (err u403))
(define-constant ERR_NOT_FOUND (err u404))
(define-constant COLORS (list "F97316" "D1C0A8" "2563EB" "65A30D"))
(define-constant MAX_SCORE u5)
(define-data-var nb-of-voters uint u0)
(define-data-var scores (list 4 uint) (list u0 u0 u0 u0))
(define-map votes principal (list 4 uint))

(define-private (is-valid (v uint) (valid bool))
    (and valid (<= v MAX_SCORE))
)
(define-private (find-best
  (next uint)
  (current (optional { id: uint, score: uint }))
)
  (let ((next-score (unwrap-panic (element-at (var-get scores) next))))
    (if (> next-score (default-to u0 (get score current)))
      (some { id: next, score: next-score })
      current
    )
  )
)

(define-public (vote (orange uint) (beige uint) (sky uint) (lime uint)) 
    (let ((values (list orange beige sky lime))) 
        (asserts! (is-none (map-get? votes tx-sender)) ERR_FORBIDDEN)
        (asserts! (fold is-valid values true) ERR_BAD_REQUEST)
        (var-set scores (map + (var-get scores) values))
        (var-set nb-of-voters (+ (var-get nb-of-voters) u1))
        (ok (map-insert votes tx-sender values))
    )
)
(define-public (unvote) 
    (let ((sender-vote (unwrap! (map-get? votes tx-sender) ERR_FORBIDDEN)))
        (var-set scores (map - (var-get scores) sender-vote))
        (var-set nb-of-voters (- (var-get nb-of-voters) u1))
        (ok (map-delete votes tx-sender))
    )
)

(define-read-only (get-nb-of-voters) (var-get nb-of-voters))
(define-read-only (get-color (id uint)) 
    (ok {
        id: id,
        value: (unwrap! (element-at COLORS id) ERR_NOT_FOUND),
        score: (unwrap! (element-at (var-get scores) id) ERR_NOT_FOUND),
    })
)
(define-read-only (get-colors)
    (map get-color (list u0 u1 u2 u3))
)
(define-read-only (get-elected) 
    (fold find-best (list u0 u1 u2 u3) none)
)