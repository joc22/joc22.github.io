if(process.env.NODE_ENV == 'production'){
  module.exports = {
    mongodbURL:"mongodb+srv://health:asd8642@cluster0-x0lz7.mongodb.net/test?retryWrites=true&w=majority"
  };
}else{
  module.exports = {
    mongodbURL: "mongodb://127.0.0.1:27017/health"
  };
}