-- LMI: Triggers

-- Auth: profile bootstrap
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_markets_updated_at
  BEFORE UPDATE ON public.markets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_price_submissions_updated_at
  BEFORE UPDATE ON public.price_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_price_alerts_updated_at
  BEFORE UPDATE ON public.price_alerts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_vendor_stalls_updated_at
  BEFORE UPDATE ON public.vendor_stalls
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_push_devices_updated_at
  BEFORE UPDATE ON public.push_devices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Product search vectors
CREATE TRIGGER products_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.products_search_vector_update();

CREATE TRIGGER product_aliases_search_refresh_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.product_aliases
  FOR EACH ROW EXECUTE FUNCTION public.product_aliases_search_refresh();

-- Price submission pipeline
CREATE TRIGGER price_submissions_outlier_check
  BEFORE INSERT ON public.price_submissions
  FOR EACH ROW EXECUTE FUNCTION public.detect_price_outlier();

CREATE TRIGGER price_submissions_sync_current
  AFTER INSERT ON public.price_submissions
  FOR EACH ROW EXECUTE FUNCTION public.sync_current_price_from_submission();

CREATE TRIGGER price_submissions_status_sync
  AFTER UPDATE OF status, price_naira, flag_count ON public.price_submissions
  FOR EACH ROW EXECUTE FUNCTION public.sync_submission_status_to_current();

-- Flag escalation
CREATE TRIGGER price_flags_escalate
  AFTER INSERT ON public.price_flags
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_price_flag();
