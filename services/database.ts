
import { User } from '../types';
import { MOCK_USERS } from '../constants';

const DB_KEYS = {
  USERS: 'fixmycity_db_users',
  LOGS: 'fixmycity_db_logs'
};

export const Database = {
  /**
   * Initialize the database. 
   * Seeds default users if the database is empty.
   */
  initialize: () => {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      console.log('FixMyCity Database: Initialization - Seeding default users...');
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(MOCK_USERS));
    } else {
      console.log('FixMyCity Database: Connected.');
    }
  },

  Users: {
    getAll: (): User[] => {
      try {
        const data = localStorage.getItem(DB_KEYS.USERS);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        console.error('DB Read Error:', e);
        return [];
      }
    },
    
    findByEmail: (email: string): User | undefined => {
      const users = Database.Users.getAll();
      return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },

    create: (user: User): boolean => {
      const users = Database.Users.getAll();
      if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
        return false; // User already exists
      }
      users.push(user);
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
      return true;
    },

    /**
     * authenticates a user against the stored dataset
     */
    validate: (email: string, pass: string): User | null => {
      const user = Database.Users.findByEmail(email);
      // In a production app, password hashing (bcrypt) would happen here.
      // For this prototype, we compare plain text as stored.
      if (user && user.password === pass) {
        return user;
      }
      return null;
    }
  }
};
