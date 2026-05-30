async function run() {
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'manager@hotel.com', password: 'password' }),
  });
  
  const loginData = await loginRes.json();
  console.log('Login Response:', loginData);
  
  const token = loginData.data.token;
  
  const guestsRes = await fetch('http://localhost:5000/api/v1/hotel/guests', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  const guestsData = await guestsRes.json();
  console.log('Guests Response:', guestsRes.status, guestsData);
}

run().catch(console.error);
