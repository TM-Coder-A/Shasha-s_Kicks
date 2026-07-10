exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const body = JSON.parse(event.body || "{}");

  if (
    body.username === "admin" &&
    body.password === process.env.ADMIN_PASSWORD
  ) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ error: "Incorrect username or password" })
  };
};
