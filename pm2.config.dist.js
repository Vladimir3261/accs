module.exports = {
    apps: [
        {
            name: "server",
            script: './server.js',
            watch: true,
            env: {
                NODE_ENV: "production",
                API_KEY: "",
                OAUTH_CLIENT_ID: "",
                OAUTH_CLIENT_SECRET: "",
            }
        }
    ]
};
