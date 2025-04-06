begin;
select plan( 2 );

select has_column( 'profiles', 'id' ); -- test that the "id" column exists in the "profiles" table
select col_is_pk( 'profiles', 'id' ); -- test that the "id" column is a primary key

select * from finish();
rollback;