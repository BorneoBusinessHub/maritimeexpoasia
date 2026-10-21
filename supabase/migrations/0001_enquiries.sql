create type enquiry_type as enum ('interest', 'exhibitor', 'sponsor', 'contact');

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  type enquiry_type not null,
  name text not null,
  company text,
  role text,
  email text not null,
  phone text,
  message text,
  details jsonb not null default '{}', -- form-specific fields: attendee_type, products, tables, support
  consent boolean not null check (consent),
  created_at timestamptz not null default now()
);

-- No public policies: only the server (service role key) can read or write.
alter table enquiries enable row level security;
