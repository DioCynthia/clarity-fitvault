;; FitVault Core Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u100))
(define-constant err-invalid-workout (err u101))  
(define-constant err-session-full (err u102))

;; Data structures
(define-map workouts
  { workout-id: uint }
  {
    creator: principal,
    name: (string-utf8 64),
    description: (string-utf8 256), 
    duration: uint,
    max-participants: uint
  }
)

(define-map workout-sessions
  { session-id: uint }
  {
    workout-id: uint,
    start-time: uint,
    participants: (list 20 principal),
    status: (string-utf8 20)
  }
)

;; Storage
(define-data-var next-workout-id uint u1)
(define-data-var next-session-id uint u1)

;; Public functions
(define-public (create-workout (name (string-utf8 64)) 
                             (description (string-utf8 256))
                             (duration uint)
                             (max-participants uint))
  (let ((workout-id (var-get next-workout-id)))
    (map-set workouts
      { workout-id: workout-id }
      {
        creator: tx-sender,
        name: name,
        description: description,
        duration: duration,
        max-participants: max-participants
      }
    )
    (var-set next-workout-id (+ workout-id u1))
    (ok workout-id)
  )
)

(define-public (create-session (workout-id uint) (start-time uint))
  (let ((session-id (var-get next-session-id))
        (workout (unwrap! (map-get? workouts { workout-id: workout-id }) (err err-invalid-workout))))
    (map-set workout-sessions
      { session-id: session-id }
      {
        workout-id: workout-id,
        start-time: start-time,
        participants: (list tx-sender),
        status: "scheduled"
      }
    )
    (var-set next-session-id (+ session-id u1))
    (ok session-id)
  )
)

(define-public (join-session (session-id uint))
  (let ((session (unwrap! (map-get? workout-sessions { session-id: session-id }) (err err-invalid-workout)))
        (workout (unwrap! (map-get? workouts { workout-id: (get workout-id session) }) (err err-invalid-workout))))
    (asserts! (< (len (get participants session)) (get max-participants workout)) (err err-session-full))
    (ok (map-set workout-sessions
      { session-id: session-id }
      (merge session { participants: (append (get participants session) tx-sender) })))
  )
)
