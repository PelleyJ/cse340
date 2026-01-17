-- 1) Insert Tony Stark (account_id and account_type should auto-handle)
INSERT INTO public.account (
  account_firstname,
  account_lastname,
  account_email,
  account_password
)
VALUES (
  'Tony',
  'Stark',
  'tony@starkent.com',
  'Iam1ronM@n'
);

-- 2) Update Tony Stark to Admin (use PK in WHERE; get the PK via subquery)
UPDATE public.account
SET account_type = 'Admin'::public.account_type
WHERE account_id = (
  SELECT account_id
  FROM public.account
  WHERE account_email = 'tony@starkent.com'
);

-- 3) Delete Tony Stark (use PK in WHERE; get the PK via subquery)
DELETE FROM public.account
WHERE account_id = (
  SELECT account_id
  FROM public.account
  WHERE account_email = 'tony@starkent.com'
);

-- 4) Update "GM Hummer" description: replace "small interiors" with "a huge interior"
-- NOTE: This uses REPLACE so you do NOT retype the whole description.
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = (
  SELECT inv_id
  FROM public.inventory
  WHERE inv_make = 'GM' AND inv_model = 'Hummer'
);

-- 5) INNER JOIN: get make, model, and classification_name for items in "Sport"
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory i
INNER JOIN public.classification c
  ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6) Add "/vehicles" into inv_image and inv_thumbnail paths using ONE query
-- Example result: /images/vehicles/a-car-name.jpg
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
