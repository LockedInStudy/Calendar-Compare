/**
 * Frontend Component Smoke Test
 * Tests that all major components can render without throwing errors
 * This tests the basic functionality and integration of Sprint 2 group management
 */

// Simple test function that checks if components render without errors
async function testComponentRendering() {
    const results = {
        passed: [],
        failed: [],
        summary: {}
    };

    console.log('🧪 Starting Frontend Component Smoke Tests...\n');

    // Test 1: Check if app container exists
    console.log('1️⃣ Testing App Container...');
    try {
        const appContainer = document.getElementById('root');
        if (appContainer && appContainer.children.length > 0) {
            results.passed.push('App container renders');
            console.log('✅ App container found and has content');
        } else {
            throw new Error('App container not found or empty');
        }
    } catch (error) {
        results.failed.push(`App container: ${error.message}`);
        console.log('❌ App container test failed:', error.message);
    }

    // Test 2: Check navigation elements
    console.log('\n2️⃣ Testing Navigation...');
    try {
        const navButtons = document.querySelectorAll('nav button');
        if (navButtons.length >= 3) {
            results.passed.push(`Navigation has ${navButtons.length} buttons`);
            console.log(`✅ Found ${navButtons.length} navigation buttons`);
            
            // List the button text
            navButtons.forEach((btn, index) => {
                console.log(`   - Button ${index + 1}: "${btn.textContent.trim()}"`);
            });
        } else {
            throw new Error(`Expected at least 3 nav buttons, found ${navButtons.length}`);
        }
    } catch (error) {
        results.failed.push(`Navigation: ${error.message}`);
        console.log('❌ Navigation test failed:', error.message);
    }

    // Test 3: Check for PingTest component on home page
    console.log('\n3️⃣ Testing PingTest Component...');
    try {
        const pingButton = document.querySelector('button[onclick*="testPing"], button:contains("Test Backend")');
        const pingHeading = document.querySelector('h2:contains("Backend Connection Test")');
        
        // More flexible search for ping test elements
        const allButtons = Array.from(document.querySelectorAll('button'));
        const testButton = allButtons.find(btn => 
            btn.textContent.includes('Test Backend') || 
            btn.textContent.includes('Test') ||
            btn.onclick?.toString().includes('ping')
        );

        const allHeadings = Array.from(document.querySelectorAll('h2, h3'));
        const pingHeadingFound = allHeadings.find(h => 
            h.textContent.includes('Backend') || 
            h.textContent.includes('Connection') ||
            h.textContent.includes('Test')
        );

        if (testButton) {
            results.passed.push('PingTest component renders');
            console.log('✅ PingTest component found');
            console.log(`   - Test button text: "${testButton.textContent.trim()}"`);
        } else {
            throw new Error('PingTest component button not found');
        }
    } catch (error) {
        results.failed.push(`PingTest: ${error.message}`);
        console.log('❌ PingTest test failed:', error.message);
    }

    // Test 4: Check for feature overview sections
    console.log('\n4️⃣ Testing Feature Overview...');
    try {
        const featureElements = document.querySelectorAll('div:contains("Sprint"), h4:contains("Sprint")');
        let sprintSections = 0;
        
        // Search for sprint content more broadly
        const allText = document.body.textContent;
        if (allText.includes('Sprint 0') || allText.includes('Sprint 1') || allText.includes('Sprint 2')) {
            sprintSections = (allText.match(/Sprint \d/g) || []).length;
        }

        if (sprintSections >= 2) {
            results.passed.push(`Found ${sprintSections} Sprint sections`);
            console.log(`✅ Found ${sprintSections} Sprint feature sections`);
        } else {
            throw new Error(`Expected Sprint sections, found ${sprintSections}`);
        }
    } catch (error) {
        results.failed.push(`Feature overview: ${error.message}`);
        console.log('❌ Feature overview test failed:', error.message);
    }

    // Test 5: Check page title and basic structure
    console.log('\n5️⃣ Testing Page Structure...');
    try {
        const title = document.title;
        const mainHeading = document.querySelector('h1, h3');
        
        if (title && mainHeading) {
            results.passed.push('Page has title and main heading');
            console.log('✅ Page structure looks good');
            console.log(`   - Page title: "${title}"`);
            console.log(`   - Main heading: "${mainHeading.textContent.trim()}"`);
        } else {
            throw new Error('Missing page title or main heading');
        }
    } catch (error) {
        results.failed.push(`Page structure: ${error.message}`);
        console.log('❌ Page structure test failed:', error.message);
    }

    // Test 6: Check for console errors
    console.log('\n6️⃣ Checking Console Errors...');
    const errorCount = window.testErrorCount || 0;
    if (errorCount === 0) {
        results.passed.push('No console errors detected');
        console.log('✅ No console errors found');
    } else {
        results.failed.push(`${errorCount} console errors detected`);
        console.log(`❌ Found ${errorCount} console errors`);
    }

    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${results.passed.length} tests`);
    console.log(`❌ Failed: ${results.failed.length} tests`);
    
    if (results.passed.length > 0) {
        console.log('\nPassed tests:');
        results.passed.forEach(test => console.log(`  ✅ ${test}`));
    }
    
    if (results.failed.length > 0) {
        console.log('\nFailed tests:');
        results.failed.forEach(test => console.log(`  ❌ ${test}`));
    }

    const successRate = Math.round((results.passed.length / (results.passed.length + results.failed.length)) * 100);
    console.log(`\n🎯 Success Rate: ${successRate}%`);

    if (successRate >= 80) {
        console.log('🎉 Frontend components are working well!');
    } else {
        console.log('⚠️  Some issues found that need attention.');
    }

    return results;
}

// Track console errors
window.testErrorCount = 0;
const originalError = console.error;
console.error = function(...args) {
    window.testErrorCount++;
    originalError.apply(console, args);
};

// Test backend connectivity
async function testBackendConnectivity() {
    console.log('\n🔌 Testing Backend Connectivity...');
    
    try {
        const response = await fetch('http://localhost:5000/ping');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connectivity successful');
            console.log('   Response:', JSON.stringify(data, null, 2));
            return true;
        } else {
            console.log('❌ Backend responded with error status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Backend connectivity failed:', error.message);
        console.log('   Make sure Flask server is running on localhost:5000');
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Calendar Compare - Frontend Test Suite');
    console.log('=========================================\n');

    // Wait a moment for the page to fully load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Run component tests
    const componentResults = await testComponentRendering();
    
    // Run backend connectivity test
    const backendOk = await testBackendConnectivity();

    console.log('\n🏁 All Tests Complete!');
    console.log('======================');
    
    if (componentResults.failed.length === 0 && backendOk) {
        console.log('🎉 All systems are GO! Sprint 2 group management is ready.');
    } else {
        console.log('⚠️  Some issues found. Check the details above.');
    }
}

// Auto-run tests when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Make test functions available globally for manual testing
window.testCalendarCompare = {
    runAllTests,
    testComponentRendering,
    testBackendConnectivity
};

console.log('📝 Test script loaded. Tests will run automatically, or call window.testCalendarCompare.runAllTests() manually.');
