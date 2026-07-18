# 1. Submit a job (captures the jobId)
curl -X POST http://localhost:8080/submit
# → {"jobId":"job:1234567890123"}

# 2. Check status with that jobId (repeat every few seconds)
curl "http://localhost:8080/checkstatus?jobId=job:1234567890123"
# → {"progress":30,"completed":false}
# → {"progress":70,"completed":false}
# → {"progress":100,"completed":true}



# in short polling you ask each time if the progress completed, but on the long polling you await that it finish
