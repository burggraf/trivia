# transactions

- id uuid
- parentid uuid
- orgid uuid
- propertyid uuid
- userid uuid
- created_at timestamp with time zone
- updated_at timestamp with time zone
- start_date timestamp with time zone
- end_date timestamp with time zone
- type text
  - lease
  - services? e.g. cleaning, repairs, etc.
- status text
- description text
- notes text
- amount numeric
- balance numeric
- metadata jsonb

## use of parentid

- transaction id that this transaction is a child of
- for a year lease, there will be a parent transaction, then a child transaction for each month in the lease
- invoicing / payments are done on individual transactions (i.e. each month)

# transactions_events

- id uuid
- transactionid uuid
- orgid uuid # not sure if this is needed / redunant
- propertyid uuid # not sure if this is needed / redunant
- userid uuid # not sure if this is needed / redunant
- created_at timestamp with time zone
- updated_at timestamp with time zone
- type text
  - application
  - payment
  - invoice generated
  - invoice sent
  - invoice paid
  - payment received
  - others???
- status text
- description text
- notes text
- amount numeric
- metadata jsonb
