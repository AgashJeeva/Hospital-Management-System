// Resolved native fetch will be used

const testAPILogin = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'agash@gmail.com',
        password: '00000000',
      }),
    });

    const data = await res.json();
    console.log('HTTP Status:', res.status);
    console.log('Response Body:', data);

    if (data.success) {
      const profileRes = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
      const profileData = await profileRes.json();
      console.log('Profile Status:', profileRes.status);
      console.log('Profile Body:', profileData);
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
};

testAPILogin();
