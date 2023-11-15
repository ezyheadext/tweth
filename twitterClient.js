const { TwitterApi } = require("twitter-api-v2")

const client = new TwitterApi({
    appKey:"1J0BdU5naAyJPfPM5buhFQ4FZ",
    appSecret: "NbH0eSzk6rg0WB7YnRQG3bvGlNJKsTMq2niUoarZbJLTfUmjzD",
    accessToken: "1519924898231046144-2CRVhwwKnKKpKsW2iQkLBjSbp3a4D6",
    accessSecret: "KcPaDRTEMX3L9nu4dmiv8bo60sir6MSsIesmOvLre0ieJ"
})

const rwClient = client.readWrite

module.exports = rwClient
