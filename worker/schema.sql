CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_at TEXT,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  location TEXT,
  ticket TEXT,
  equipment TEXT,
  notes TEXT,
  delivered_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_deliveries_workspace_status
  ON deliveries(workspace_id, status, scheduled_at);
