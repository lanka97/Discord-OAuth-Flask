const isEmail = (email) => {
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    if (email.match(re)) {
        return true;
    }
    return false;

}

const isEmpty = (string) => {
    if (string.trim() === '') {
        return true;
    }
    return false;
}

module.exports = {
    isEmail,
    isEmpty
}