const getModelMapperList = () => {

    const columnReqBodyMapper = new Map();
    //columnName, reqBodyName
    columnReqBodyMapper.set('brand', 'brand')
    //columnReqBodyMapper.set('models', 'models')
    columnReqBodyMapper.set('qty', 'qty')
    columnReqBodyMapper.set('model', 'model')
    columnReqBodyMapper.set('price', 'price')
    
    return columnReqBodyMapper;

}

const getItemMapperList = () => {

    const columnReqBodyMapper = new Map();
    //columnName, reqBodyName
    columnReqBodyMapper.set('itemName', 'itemName')
    //columnReqBodyMapper.set('models', 'models')
    columnReqBodyMapper.set('imgs', 'imgs')
    columnReqBodyMapper.set('colors', 'colors')
    columnReqBodyMapper.set('imgs', 'imgs')
    columnReqBodyMapper.set('specs', 'specs')
    columnReqBodyMapper.set('discount', 'discount')
    columnReqBodyMapper.set('desc', 'desc')
    columnReqBodyMapper.set('isNewArrival', 'isNewArrival')
    columnReqBodyMapper.set('isBasicCase', 'isBasicCase')
    columnReqBodyMapper.set('isNewDesign', 'isNewDesign')
    columnReqBodyMapper.set('isJustforYou', 'isJustforYou')
    columnReqBodyMapper.set('isBestSeller', 'isBestSeller')
    columnReqBodyMapper.set('priceStartAt', 'priceStartAt')
    columnReqBodyMapper.set('priceEndAt', 'priceEndAt')
    columnReqBodyMapper.set('createdAt', 'createdAt')
    columnReqBodyMapper.set('updatedAt', 'updatedAt')
    
    return columnReqBodyMapper;

}
const getCartItemMapperList = () => {

    const columnReqBodyMapper = new Map();
    //columnName, reqBodyName
    columnReqBodyMapper.set('itemName', 'itemName')
    columnReqBodyMapper.set('brand', 'brand')
    columnReqBodyMapper.set('selectedSize', 'selectedSize')
    columnReqBodyMapper.set('imgs', 'imgs')
    columnReqBodyMapper.set('selectedColor', 'selectedColor')
    columnReqBodyMapper.set('selectedModel', 'selectedModel')
    columnReqBodyMapper.set('itemCount', 'itemCount')
    columnReqBodyMapper.set('price', 'price')
    columnReqBodyMapper.set('createdAt', 'createdAt')
    columnReqBodyMapper.set('updatedAt', 'updatedAt')
    
    return columnReqBodyMapper;

}

const getProfileMapperList = () => {

    const columnReqBodyMapper = new Map();
    //columnName, reqBodyName
    columnReqBodyMapper.set('fname', 'fname')
    columnReqBodyMapper.set('lname', 'lname')
    columnReqBodyMapper.set('email', 'email')
    columnReqBodyMapper.set('createdAt', 'createdAt')
    columnReqBodyMapper.set('updatedAt', 'updatedAt')
    
    return columnReqBodyMapper;

}

const getUserProfileMapperList = () => {

    const columnReqBodyMapper = new Map();
    //columnName, reqBodyName
    columnReqBodyMapper.set('fname', 'fname')
    columnReqBodyMapper.set('lname', 'lname')
    columnReqBodyMapper.set('city', 'city')
    columnReqBodyMapper.set('address', 'address')
    columnReqBodyMapper.set('companyName', 'companyName')
    columnReqBodyMapper.set('postalCode', 'postalCode')
    columnReqBodyMapper.set('phoneNumber', 'phoneNumber')
    columnReqBodyMapper.set('password', 'password')
    columnReqBodyMapper.set('createdAt', 'createdAt')
    columnReqBodyMapper.set('updatedAt', 'updatedAt')
    
    return columnReqBodyMapper;

}
const getPromoCodeMapperList = () => {
    const columnReqBodyMapper = new Map();
    //columnName, reqBodyName
    columnReqBodyMapper.set('expiryDate', 'expiryDate')
    columnReqBodyMapper.set('discountPercentage', 'discountPercentage')
    columnReqBodyMapper.set('createdAt', 'createdAt')
    columnReqBodyMapper.set('updatedAt', 'updatedAt')
    
    return columnReqBodyMapper;

}

const getHomePageMapperList = () => {
    const columnReqBodyMapper = new Map();
    //columnName, reqBodyName
    columnReqBodyMapper.set('imgUrl', 'imgUrl')
    columnReqBodyMapper.set('createdAt', 'createdAt')
    columnReqBodyMapper.set('updatedAt', 'updatedAt')
    
    return columnReqBodyMapper;

}

const getOrderMapperList = () => {

    const columnReqBodyMapper = new Map();
    //columnName, reqBodyName
    columnReqBodyMapper.set('orderStatus', 'orderStatus')
    columnReqBodyMapper.set('deliveredAt', 'deliveredAt')
    columnReqBodyMapper.set('createdAt', 'createdAt')
    columnReqBodyMapper.set('updatedAt', 'updatedAt')
    
    return columnReqBodyMapper;

}

const getPaymentMapperList = () => {

    const columnReqBodyMapper = new Map();
    //columnName, reqBodyName
    columnReqBodyMapper.set('paymentMethod', 'paymentMethod')
    columnReqBodyMapper.set('paymentResult', 'paymentResult')
    columnReqBodyMapper.set('orderID', 'orderID')
    columnReqBodyMapper.set('payerID', 'payerID')
    columnReqBodyMapper.set('paymentAmt', 'paymentAmt')
    columnReqBodyMapper.set('isPaid', 'isPaid')
    columnReqBodyMapper.set('paidAt', 'paidAt')
    columnReqBodyMapper.set('createdAt', 'createdAt')
    columnReqBodyMapper.set('updatedAt', 'updatedAt')
    
    return columnReqBodyMapper;

}

module.exports = {
    getItemMapperList,
    getOrderMapperList,
    getCartItemMapperList,
    getPaymentMapperList,
    getPromoCodeMapperList,
    getHomePageMapperList,
    getUserProfileMapperList,
    getProfileMapperList,
    getModelMapperList
}