begin;
select plan( 3 );
select policies_are(
  'public',
  'categories',
  ARRAY [
    'Allow authenticated users to view categories',
    'Allow superadmins to manage categories'
  ]
);
select policies_are(
  'public',
  'claims',
  ARRAY [
    'Allow admins/superadmins to insert claims for employees',
    'Allow admins/superadmins to update (approve/deny) claims',
    'Allow admins/superadmins to view all claims',
    'Allow employees to insert own claims',
    'Allow employees to view own claims',
    'Disallow deletion of claims'
  ]
);
select policies_are(
  'public',
  'profiles',
  ARRAY [
    'Allow admins to update employee profiles',
    'Allow admins to view employee profiles',
    'Allow admins/superadmins to delete employee/admin profiles',
    'Allow admins/superadmins to insert employee/admin profiles',
    'Allow superadmins to update any profile',
    'Allow superadmins to view all profiles',
    'Allow users to update their own profile',
    'Allow users to view their own profile'
  ]
);
select * from finish();
rollback;