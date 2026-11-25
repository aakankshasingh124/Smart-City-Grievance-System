const fs = require('fs');
const path = require('path');

const publicDir = 'C:\\Users\\HP\\.gemini\\antigravity\\scratch\\jansahayak-ai\\public';
const jsDir = path.join(publicDir, 'js');

global.window = global;
global.document = {
    getElementById: () => ({ innerHTML: '', appendChild: () => {}, classList: { add: () => {}, remove: () => {} } }),
    addEventListener: () => {}
};
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

// Mock API
global.API = {
    getCurrentUser: () => null,
    getToken: () => null,
    stats: {
        getPublic: async () => ({
            summary: { totalComplaints: 8, resolvedComplaints: 3, resolutionPercentage: 38, inProgressComplaints: 3, pendingComplaints: 2 },
            categoryBreakdown: {}
        })
    }
};

eval(fs.readFileSync(path.join(jsDir, 'components', 'navbar.js'), 'utf8'));
eval(fs.readFileSync(path.join(jsDir, 'components', 'footer.js'), 'utf8'));
eval(fs.readFileSync(path.join(jsDir, 'components', 'home.js'), 'utf8'));
eval(fs.readFileSync(path.join(jsDir, 'components', 'aiChatbot.js'), 'utf8'));

async function prerender() {
    const navHtml = Navbar.render();
    const homeHtml = await Home.render();
    const footerHtml = Footer.render();
    const chatbotHtml = AIChatbot.render();

    const fullAppHtml = `
        ${navHtml}
        <main class="min-h-[calc(100vh-280px)]">
            ${homeHtml}
        </main>
        ${footerHtml}
        ${chatbotHtml}
    `;

    const indexPath = path.join(publicDir, 'index.html');
    let indexHtml = fs.readFileSync(indexPath, 'utf8');

    // Replace the inner content of <div id="app" ...>...</div>
    const regex = /<div id="app" class="flex-1 flex flex-col">[\s\S]*?<\/div>\s*<!-- Modals Container -->/;
    if (regex.test(indexHtml)) {
        indexHtml = indexHtml.replace(regex, `<div id="app" class="flex-1 flex flex-col">\n${fullAppHtml}\n    </div>\n\n    <!-- Modals Container -->`);
        fs.writeFileSync(indexPath, indexHtml, 'utf8');
        console.log('Successfully pre-rendered index.html with full Homepage markup!');
    } else {
        console.warn('Regex match failed for #app in index.html');
    }
}

prerender().catch(console.error);
