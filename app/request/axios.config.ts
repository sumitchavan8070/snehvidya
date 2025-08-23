import { registerAs } from '@nestjs/config';

export default registerAs('axios', () => ({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://crm.gradding.com/mobileApi/',
  headers: {
    source: 'Web',
    appName: process.env.APP_NAME || 'GradLead Web',
    packageName: process.env.PACKAGE_NAME || 'com.gradlead.web',
    appBuildNumber: process.env.APP_BUILD_NUMBER || '1',
    appVersion: process.env.APP_VERSION || '1.0.0',
  },
}));
