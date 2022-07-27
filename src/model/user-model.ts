import mongoose from 'mongoose'

const schema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   email: {
      type: String,
      required: true,
      unique: true,
   },
   password: {
      type: String,
      required: true,
   },
   active: {
      type: Boolean,
      required: true,      
   },
})

export default mongoose.model('User', schema)
