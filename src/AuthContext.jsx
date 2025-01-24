import { createContext, useContext, useState, useEffect } from 'react'
import { auth, db } from './firebase'
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    sendSignInLinkToEmail,
    signOut
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Get additional user data from Firestore
                const docRef = doc(db, "users", user.uid)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    setUserData(docSnap.data())
                } else {
                    // Create user document if doesn't exist
                    const newUserData = {
                        displayName: user.displayName,
                        email: user.email,
                        createdAt: new Date(),
                        lastLogin: new Date()
                    }
                    await setDoc(docRef, newUserData)
                    setUserData(newUserData)
                }
            }
            setUser(user)
            setLoading(false)
        })

        return unsubscribe
    }, [])

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider()
        try {
            const result = await signInWithPopup(auth, provider)
            const docRef = doc(db, "users", result.user.uid)
            const docSnap = await getDoc(docRef)

            if (!docSnap.exists()) {
                await setDoc(docRef, {
                    displayName: result.user.displayName,
                    email: result.user.email,
                    createdAt: new Date(),
                    lastLogin: new Date()
                })
            }
            return result
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    const sendLoginLink = async (email) => {
        const actionCodeSettings = {
            url: `${window.location.origin}/login/verify`,
            handleCodeInApp: true
        }

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings)
            window.localStorage.setItem('emailForSignIn', email)
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }

    const logout = () => signOut(auth)

    const value = {
        user,
        userData,
        loading,
        logout,
        signInWithGoogle
    }

    return (
        <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
    )
}