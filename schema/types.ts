export interface AccountProps {
    user: {
        id: string;
        objectId: string;
        username: string;
        name: string;
        bio: string;
        image: string;
      };
      btnTitle: string;
}


export interface UserProfile {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}