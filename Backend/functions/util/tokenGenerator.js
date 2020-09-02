const constants = require("./constants");
const uuid4 = require("uuid4");
const jwt = require('jsonwebtoken')

const secret = "PhoneCase123"
const issueToken = (uid, email, oldCycle = 0) => {
    
    let cycle = oldCycle + 1
    let opts = {}
    opts.subject = uid
    opts.expiresIn = constants.TOKEN_EXPIRATION_TIME;
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
