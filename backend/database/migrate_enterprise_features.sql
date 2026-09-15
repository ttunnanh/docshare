USE hoc_lieu_so_db;

-- Account lifecycle
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS locked_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS last_login_at DATETIME NULL;

-- Moderation metadata
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS reviewed_by INT NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at DATETIME NULL;

-- Security / administration audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id VARCHAR(64) NULL,
  details TEXT NULL,
  ip_address VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_user (user_id),
  KEY idx_audit_action (action),
  KEY idx_audit_created (created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Keep legacy rows usable.
UPDATE users SET is_active = 1 WHERE is_active IS NULL;
