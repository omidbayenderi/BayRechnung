-- Update handle_new_user trigger to create company settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile
  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'admin' -- Default starting role
  );
  
  -- Create free subscription by default
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active');

  -- Create default company settings to prevent RLS insert issues on client side
  INSERT INTO public.company_settings (
    user_id, 
    company_name, 
    industry,
    phone,
    email,
    address,
    city,
    postal_code
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'),
    COALESCE(NEW.raw_user_meta_data->>'industry', 'general'),
    NEW.raw_user_meta_data->>'phone',
    NEW.email,
    NEW.raw_user_meta_data->>'street',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'zip'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
