async function verifyCaptcha(token) {

  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET,
        response: token
      })
    }
  );

  const data = await response.json();

  return data;
}

module.exports = { verifyCaptcha };