CREATE TABLE public.rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  label TEXT NOT NULL,
  price_per_kg NUMERIC,
  sort_order INTEGER NOT NULL DEFAULT 0
);

GRANT SELECT ON public.rates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rates TO authenticated;
GRANT ALL ON public.rates TO service_role;

ALTER TABLE public.rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rates" ON public.rates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owner can insert rates" ON public.rates FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner can update rates" ON public.rates FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner can delete rates" ON public.rates FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER rates_set_updated_at BEFORE UPDATE ON public.rates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.rates (label, sort_order) VALUES
  ('Broiler chicken', 1),
  ('Leg piece', 2),
  ('Spring chicken', 3),
  ('Nadan kozhi', 4);

ALTER PUBLICATION supabase_realtime ADD TABLE public.rates;