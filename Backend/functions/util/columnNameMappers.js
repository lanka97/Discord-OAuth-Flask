const getUserProfileMapperList = () => {

    const columnReqBodyMapper = new Map();

    columnReqBodyMapper.set('fname', 'fname')
    columnReqBodyMapper.set('lname', 'lname')
    columnReqBodyMapper.set('phoneNumber', 'phoneNumber')
    columnReqBodyMapper.set('password', 'password')
    columnReqBodyMapper.set('createdAt', 'createdAt')
    columnReqBodyMapper.set('updatedAt', 'updatedAt')
    
    return columnReqBodyMapper;

}

module.exports = {
    getUserProfileMapperList,
}