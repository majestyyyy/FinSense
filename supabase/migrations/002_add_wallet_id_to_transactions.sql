-- Add wallet_id column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL;

-- Create index on wallet_id for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
