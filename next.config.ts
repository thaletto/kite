import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
    cacheComponents: true,
};

export default withBotId(nextConfig);
