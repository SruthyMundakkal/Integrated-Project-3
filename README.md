# How to use
1. Start local containers: ```supabase start```
2. Run app: ```npm run dev```

### Update local DB from remote
1. Login CLI: ```supabase login```
2. If project needs to be linked: ```supabase link```
3. Pull changes into a migration file: ```supabase db pull```
4. Implement migration: ```supabase db reset```

## notes
App is currently set in its .env.local to point to the local API. Values are taken from the output from running ```supabase start```.