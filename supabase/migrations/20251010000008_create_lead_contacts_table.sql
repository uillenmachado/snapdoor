-- Tabela para múltiplos contatos (emails e telefones)
CREATE TABLE IF NOT EXISTS lead_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'phone')),
  value TEXT NOT NULL,
  label TEXT, -- Ex: "Pessoal", "Trabalho", "WhatsApp"
  is_primary BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_lead_contacts_lead_id ON lead_contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_contacts_type ON lead_contacts(type);
CREATE INDEX IF NOT EXISTS idx_lead_contacts_user_id ON lead_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_contacts_is_primary ON lead_contacts(is_primary);

-- Comentários
COMMENT ON TABLE lead_contacts IS 'Múltiplos contatos (emails e telefones) por lead com marcação de preferencial';
COMMENT ON COLUMN lead_contacts.type IS 'Tipo do contato: email ou phone';
COMMENT ON COLUMN lead_contacts.value IS 'Valor do contato (email ou telefone)';
COMMENT ON COLUMN lead_contacts.label IS 'Rótulo opcional: Pessoal, Trabalho, WhatsApp, etc';
COMMENT ON COLUMN lead_contacts.is_primary IS 'Marca o contato preferencial/principal';
COMMENT ON COLUMN lead_contacts.is_verified IS 'Indica se o contato foi verificado';

-- RLS
ALTER TABLE lead_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their lead contacts"
  ON lead_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their lead contacts"
  ON lead_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their lead contacts"
  ON lead_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their lead contacts"
  ON lead_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_lead_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lead_contacts_updated_at
  BEFORE UPDATE ON lead_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_contacts_updated_at();

-- Função para garantir apenas um contato primary por tipo
CREATE OR REPLACE FUNCTION ensure_single_primary_contact()
RETURNS TRIGGER AS $$
BEGIN
  -- Se está marcando como primary
  IF NEW.is_primary = TRUE THEN
    -- Remove is_primary de outros contatos do mesmo tipo para este lead
    UPDATE lead_contacts
    SET is_primary = FALSE
    WHERE lead_id = NEW.lead_id
      AND type = NEW.type
      AND id != NEW.id
      AND is_primary = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_primary_contact_trigger
  BEFORE INSERT OR UPDATE ON lead_contacts
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_contact();
