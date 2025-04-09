begin;
select plan(2);
select function_returns( 'get_my_role', 'text' );
select function_returns( 'get_claim_category_totals_last_6_months', 'setof record' );
rollback;