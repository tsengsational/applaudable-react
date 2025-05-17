import { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { firestore } from '../firebase';

// Collection references
const programsCollection = collection(firestore, 'programs');
const collaboratorsCollection = collection(firestore, 'collaborators');

// Collaborator operations
export const createCollaborator = async (collaboratorData) => {
  try {
    const docRef = await addDoc(collaboratorsCollection, {
      ...collaboratorData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating collaborator:', error);
    throw error;
  }
};

export const getCollaborator = async (id) => {
  try {
    const docRef = doc(firestore, 'collaborators', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting collaborator:', error);
    throw error;
  }
};

export const getUserCollaborators = async (userId) => {
  try {
    const q = query(
      collaboratorsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user collaborators:', error);
    throw error;
  }
};

export const updateCollaborator = async (id, collaboratorData) => {
  try {
    const docRef = doc(firestore, 'collaborators', id);
    await updateDoc(docRef, collaboratorData);
  } catch (error) {
    console.error('Error updating collaborator:', error);
    throw error;
  }
};

export const deleteCollaborator = async (id) => {
  try {
    const docRef = doc(firestore, 'collaborators', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting collaborator:', error);
    throw error;
  }
};

// Program operations
export const createProgram = async (programData) => {
  try {
    const docRef = await addDoc(programsCollection, {
      ...programData,
      createdAt: serverTimestamp(),
      subscriptionStatus: 'free' // Default to free tier
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating program:', error);
    throw error;
  }
};

export const getProgram = async (id) => {
  try {
    const docRef = doc(firestore, 'programs', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const program = {
        id: docSnap.id,
        ...docSnap.data()
      };

      // Fetch collaborator details for each byline
      const bylinesWithCollaborators = await Promise.all(
        program.bylines.map(async (byline) => {
          if (byline.collaboratorId) {
            const collaborator = await getCollaborator(byline.collaboratorId);
            return {
              ...byline,
              collaborator
            };
          }
          return byline;
        })
      );

      return {
        ...program,
        bylines: bylinesWithCollaborators
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting program:', error);
    throw error;
  }
};

export const getUserPrograms = async (userId) => {
  try {
    // First, get all programs for the user
    const q = query(
      programsCollection,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const programs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort the programs in memory
    programs.sort((a, b) => {
      const dateA = a.createdAt?.toDate() || new Date(0);
      const dateB = b.createdAt?.toDate() || new Date(0);
      return dateB - dateA; // Descending order
    });

    // Fetch collaborator details for each program's bylines
    const programsWithCollaborators = await Promise.all(
      programs.map(async (program) => {
        const bylinesWithCollaborators = await Promise.all(
          program.bylines.map(async (byline) => {
            if (byline.collaboratorId) {
              const collaborator = await getCollaborator(byline.collaboratorId);
              return {
                ...byline,
                collaborator
              };
            }
            return byline;
          })
        );

        return {
          ...program,
          bylines: bylinesWithCollaborators
        };
      })
    );

    return programsWithCollaborators;
  } catch (error) {
    console.error('Error getting user programs:', error);
    throw error;
  }
};

export const updateProgram = async (id, programData) => {
  try {
    const docRef = doc(firestore, 'programs', id);
    await updateDoc(docRef, programData);
  } catch (error) {
    console.error('Error updating program:', error);
    throw error;
  }
};

export const deleteProgram = async (id) => {
  try {
    const docRef = doc(firestore, 'programs', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting program:', error);
    throw error;
  }
};

export const generateUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
}; 