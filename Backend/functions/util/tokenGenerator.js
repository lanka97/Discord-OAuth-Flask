const uuid4 = require("uuid4");
const jwt = require('jsonwebtoken')

const secret = "SSD2"
const TOKEN_EXPIRATION_TIME = 60 * 60 * 24 * 31 * 3;
const issueToken = (uid, email, oldCycle = 0) => {
    
    let cycle = oldCycle + 1
    let opts = {}
    opts.subject = uid
    opts.expiresIn = TOKEN_EXPIRATION_TIME;
    let tokenId = uuid4()

    const token = jwt.sign({ email , uid,  tokenId, cycle }, secret, opts)
    return token
}

const verifyToken = (token) => {

    try {
      const decoded = jwt.verify(token, secret)
      
      return decoded
    } catch (err) {
      return false
    }
  
  }

module.exports = {
    issueToken,
    verifyToken
};
