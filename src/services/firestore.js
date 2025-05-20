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
    
    // Get the newly created collaborator
    const docSnap = await getDoc(docRef);
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error('Error creating collaborator:', error);
    throw error;
  }
};

export const getCollaborator = async (id) => {
  try {
    console.log('Fetching collaborator with ID:', id);
    const docRef = doc(firestore, 'collaborators', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const collaborator = {
        id: docSnap.id,
        ...docSnap.data()
      };
      console.log('Found collaborator:', collaborator);
      return collaborator;
    }
    console.log('No collaborator found with ID:', id);
    return null;
  } catch (error) {
    console.error('Error getting collaborator:', error);
    throw error;
  }
};

export const getUserCollaborators = async (userId) => {
  try {
    console.log('Fetching collaborators for user:', userId);
    const q = query(
      collaboratorsCollection,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Query snapshot:', querySnapshot);
    
    if (querySnapshot.empty) {
      console.log('No collaborators found for user:', userId);
      return [];
    }

    const collaborators = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Collaborator data:', { id: doc.id, ...data });
      return {
        id: doc.id,
        ...data
      };
    });

    // Sort in memory by createdAt
    collaborators.sort((a, b) => {
      const dateA = a.createdAt?.toDate() || new Date(0);
      const dateB = b.createdAt?.toDate() || new Date(0);
      return dateB - dateA; // Descending order
    });

    console.log('Sorted collaborators:', collaborators);
    return collaborators;
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

      // Ensure sections and bylines exist
      if (!program.sections) {
        program.sections = [];
      }

      // Fetch collaborator details for each byline
      const bylinesWithCollaborators = await Promise.all(
        (program.sections || []).map(async (section) => {
          if (!section.bylines) {
            section.bylines = [];
          }
          
          const bylinesWithCollaborators = await Promise.all(
            section.bylines.map(async (byline) => {
              if (byline.id) {
                const collaborator = await getCollaborator(byline.id);
                return {
                  ...byline,
                  collaborator
                };
              }
              return byline;
            })
          );

          return {
            ...section,
            bylines: bylinesWithCollaborators
          };
        })
      );

      return {
        ...program,
        sections: bylinesWithCollaborators
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
        // Ensure sections exist
        if (!program.sections) {
          program.sections = [];
        }

        const sectionsWithCollaborators = await Promise.all(
          program.sections.map(async (section) => {
            // Ensure bylines exist
            if (!section.bylines) {
              section.bylines = [];
            }

            const bylinesWithCollaborators = await Promise.all(
              section.bylines.map(async (byline) => {
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
              ...section,
              bylines: bylinesWithCollaborators
            };
          })
        );

        return {
          ...program,
          sections: sectionsWithCollaborators
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