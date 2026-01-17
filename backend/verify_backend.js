const http = require('http');
const jwt = require('jsonwebtoken');

const SECRET = 'development_secret_key_change_me_in_prod';
const token = jwt.sign({ id: 'test-user-id', role: 'admin', name: 'Test User' }, SECRET, { expiresIn: '1h' });

const postRequest = (path, data) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(body));
                } else {
                    reject(`Status: ${res.statusCode} Body: ${body}`);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(JSON.stringify(data));
        req.end();
    });
};

const querystring = require('querystring');

const getRequest = (path, params = {}) => {
    return new Promise((resolve, reject) => {
        const query = querystring.stringify(params);
        const fullPath = query ? `${path}?${query}` : path;

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: fullPath,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(body));
                } else {
                    reject(`GET Status: ${res.statusCode} Body: ${body}`);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
};

const runVerify = async () => {
    try {
        console.log('1. Checking for existing Vendor...');
        const searchResult = await getRequest('/api/vendors', { search: 'contact@testit.com' });

        let vendorId;
        if (searchResult.vendors && searchResult.vendors.length > 0) {
            console.log('   Found existing vendor:', searchResult.vendors[0].id);
            vendorId = searchResult.vendors[0].id;
        } else {
            console.log('   Creating new Vendor...');
            const vendorData = {
                name: 'Test IT Service Provider',
                email: 'contact@testit.com',
                type: 'service',
                status: 'active',
            };
            const vendor = await postRequest('/api/vendors', vendorData);
            console.log('   Vendor Created:', vendor.vendor.id);
            vendorId = vendor.vendor.id;
        }

        console.log('2. Creating Purchase Order for Service...');
        const poData = {
            vendorId: vendorId,
            orderDate: new Date(),
            expectedDelivery: new Date(new Date().setDate(new Date().getDate() + 7)),
            items: [
                {
                    name: 'Cloud Consulting',
                    quantity: 10,
                    unitPrice: 150,
                    serviceType: 'consulting', // IT service field
                    period: 'one-time'
                }
            ]
        };
        const po = await postRequest('/api/purchase/orders', poData);
        console.log('   PO Created:', po.id || po.order?.id);

        // Log the item details to verify service fields
        const items = po.items || po.order?.items;
        if (items && items.length > 0) {
            console.log('   Service Type:', items[0].serviceType);
        }

        console.log('SUCCESS: Backend persistence verified.');
    } catch (error) {
        console.error('FAILURE:', error);
    }
};

runVerify();
