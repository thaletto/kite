<div align="center">

# OpenGPT
***An Open Source ChatGPT Alternative***

<img src="https://raw.githubusercontent.com/thaletto/static/refs/heads/main/assets/opengpt.webp" width="100%" />

![GitHub Repo stars](https://img.shields.io/github/stars/thaletto/opengpt?style=for-the-badge&logo=github)
![GitHub forks](https://img.shields.io/github/forks/thaletto/opengpt?style=for-the-badge&logo=github)
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/thaletto/opengpt?style=for-the-badge&logo=github)
<a href="https://vercel.com/new/clone?repository-url=https://github.com/thaletto/opengpt"> <img src="https://vercel.com/button" alt="Deploy with Vercel"/> </a> 

</div>



## About OpenGPT
**OpenGPT** is an open-source alternative to ChatGPT, powered by the [AI SDK](https://ai-sdk.dev) and the [Vercel AI Gateway](https://vercel.com/ai-gateway).  

It leverages **AI Elements**, **Streamdown**, and modern **Next.js 16** features like  
**Server Functions** and **React Server Components (RSC)**.

## Features
- Built with Next.js 16 (Server Functions + RSC)  
- Powered by Vercel AI SDK + AI Gateway  
- AI Elements and Streamdown integration
- Supports oAuth
- Fully deployable on **Vercel** in one click  

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/thaletto/opengpt.git
cd opengpt
```

### 2. Install dependencies
```bash
pnpm install
# or
npm install
# or
yarn install
# or
bun install
```

### 3. Setup environment variables
Create a .env.local file in the root of the project:

*Get an AI Gateway API key [here](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys%3Futm_source%3Dai_gateway_landing_page&title=Get+an+API+Key)*

```
AI_GATEWAY_API_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

DATABASE_URL=

BASE64_TOKEN=
```

### 4. Run locally
```bash
pnpm dev
# or
npm run dev
# or
yarn dev
# or
bun dev
```
