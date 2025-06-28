import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "jardin-virtual-demo.firebaseapp.com",
  projectId: "jardin-virtual-demo",
  storageBucket: "jardin-virtual-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
}

// Para demo - En producción, usar variables de entorno
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app