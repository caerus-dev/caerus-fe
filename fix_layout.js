const fs = require('fs');
const files = [
  'app/dashboard/applications/new/page.tsx',
  'app/dashboard/applications/[id]/settings/page.tsx',
  'app/dashboard/applications/[id]/team/page.tsx',
  'app/dashboard/billing/page.tsx',
  'app/dashboard/docs/page.tsx'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import\s+\{\s*DashboardLayout\s*\}\s+from\s+['"].*?['"];?[\r\n]*/g, '');
  content = content.replace(/<DashboardLayout>([\s\S]*?)<\/DashboardLayout>/, '$1');
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}
