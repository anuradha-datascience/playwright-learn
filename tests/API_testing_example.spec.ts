import { test, expect } from '@playwright/test';
test('GET users API', async ({ request }) => { 
    const response = await request.get('https://jsonplaceholder.typicode.com/users'); 
    expect(response.status()).toBe(200); const body = await response.json(); 
    console.log(body); 
});
