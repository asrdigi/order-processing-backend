import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {

 // request header contains: authorization: Bearer  <token>
// authHeader = Bearer  <token>
 const authHeader = req.headers["authorization"];

  if (!authHeader)
    return res.status(401).json({ message: "Token required" });

  //token = <token>
const token = authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Invalid token" });

  /*
  jwt.verify()
    Validates signature
    Extracts payload
    Returns:
    user = {
      id: 5,
      username: "sri",
      role: "ADMIN"
      iat: ...,
      exp: ...
    }

    We are storing the user info in req.user so that it can be used in 
    subsequent middlewares and route handlers:
        req.user = user;
  */
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });

    req.user = user;
    next();
  });
};
