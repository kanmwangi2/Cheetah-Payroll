import { doc, getDoc, collection, getDocs, setDoc, updateDoc, query, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../core/config/firebase.config';
import { User, Company } from '../types';

export async function getUserProfile(userId: string): Promise<User | null> {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null;
}

export async function createUserProfile(userData: {
  id: string;
  email: string;
  name: string;
}): Promise<User> {
  // Check if this is the first user in the system
  const usersRef = collection(db, 'users');
  const firstUserQuery = query(usersRef, limit(1));
  const existingUsers = await getDocs(firstUserQuery);
  
  // First user gets primary_admin role, others get company_admin
  const isFirstUser = existingUsers.empty;
  const role = isFirstUser ? 'primary_admin' : 'company_admin';
  
  const newUser: User = {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    role,
    companyIds: [],
    profileData: {}
  };
  
  // Save to Firestore
  const userRef = doc(db, 'users', userData.id);
  await setDoc(userRef, newUser);
  
  return newUser;
}

export async function getCompaniesByIds(companyIds: string[]): Promise<Company[]> {
  if (!companyIds.length) {return [];}
  const companiesRef = collection(db, 'companies');
  const allCompaniesSnap = await getDocs(companiesRef);
  return allCompaniesSnap.docs
    .filter(doc => companyIds.includes(doc.id))
    .map(doc => ({ id: doc.id, ...doc.data() }) as Company);
}

export async function uploadProfilePicture(userId: string, imageBlob: Blob): Promise<string> {
  try {
    // Create a reference to the profile picture in storage
    const imageRef = ref(storage, `profile-pictures/${userId}/${Date.now()}.jpg`);
    
    // Upload the image
    const snapshot = await uploadBytes(imageRef, imageBlob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update user profile with the new image URL
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'profileData.profilePicture': downloadURL
    });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw new Error('Failed to upload profile picture');
  }
}

export async function removeProfilePicture(userId: string): Promise<void> {
  try {
    // Get current user profile to find the image URL
    const userProfile = await getUserProfile(userId);
    const currentImageUrl = userProfile?.profileData?.profilePicture;
    
    if (currentImageUrl && typeof currentImageUrl === 'string') {
      // Extract the path from the URL to delete from storage
      try {
        // Extract the path from the full URL
        const url = new URL(currentImageUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
        if (pathMatch && pathMatch[1]) {
          const imagePath = decodeURIComponent(pathMatch[1]);
          const imageRef = ref(storage, imagePath);
          await deleteObject(imageRef);
        }
      } catch (storageError) {
        // If image doesn't exist in storage, that's okay, just continue
        console.warn('Image not found in storage:', storageError);
      }
    }
    
    // Remove the profile picture URL from the user profile
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'profileData.profilePicture': null
    });
  } catch (error) {
    console.error('Error removing profile picture:', error);
    throw new Error('Failed to remove profile picture');
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
}
