CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT DEFAULT '🏷️',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS category_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  keyword TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS category_keywords_category_keyword_unique
ON category_keywords (category_id, LOWER(keyword));

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read categories"
ON categories FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "authenticated users can write categories"
ON categories FOR ALL
TO authenticated
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY "authenticated users can read category keywords"
ON category_keywords FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "authenticated users can write category keywords"
ON category_keywords FOR ALL
TO authenticated
USING (TRUE)
WITH CHECK (TRUE);

INSERT INTO categories (id, label, icon, sort_order)
VALUES
  ('disposable', 'พอตใช้แล้วทิ้ง', '🚬', 10),
  ('pod', 'เครื่อง / พอต', '📱', 20),
  ('pod-refill', 'หัวพอต / น้ำยาหัว', '💧', 30),
  ('saltnic', 'ซอลท์นิค', '🧪', 40),
  ('freebase', 'ฟรีเบส', '🧴', 50),
  ('coil-atom', 'คอยล์ / อะตอม', '🔧', 60),
  ('accessory', 'อุปกรณ์เสริม', '🔋', 70)
ON CONFLICT (id) DO UPDATE
SET label = EXCLUDED.label,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO category_keywords (category_id, keyword)
SELECT 'disposable', keyword
FROM UNNEST(ARRAY[
  'disposable',
  'puffs',
  'puff',
  'infy',
  'relx',
  'ks',
  'kardinal',
  'esko bar switch 20k',
  'relx creator 20k device'
]) AS keyword
ON CONFLICT DO NOTHING;

INSERT INTO category_keywords (category_id, keyword)
SELECT 'pod', keyword
FROM UNNEST(ARRAY[
  'pod',
  'device',
  'เครื่อง',
  'พอต',
  'relx infinity',
  'infy device',
  'infy cube box by this is salt',
  'infy pod close system',
  'infy world cup series',
  'relx essential 2',
  'relx starter kit'
]) AS keyword
ON CONFLICT DO NOTHING;

INSERT INTO category_keywords (category_id, keyword)
SELECT 'pod-refill', keyword
FROM UNNEST(ARRAY[
  'หัว',
  'refill',
  'pod pack',
  'หัวพอต',
  'น้ำยาหัว',
  'หัวน้ำยา',
  'หัวน้ำยา infy plus',
  'หัวพอต relx',
  'หัวพอต relx pro',
  'หัวน้ำยา marbo zero pod',
  'หัวน้ำยา cliq',
  'หัวน้ำยา one punthai pod',
  'หัวน้ำยา vazer one pod',
  'relx ultra pod'
]) AS keyword
ON CONFLICT DO NOTHING;

INSERT INTO category_keywords (category_id, keyword)
SELECT 'saltnic', keyword
FROM UNNEST(ARRAY[
  'salt',
  'saltnic',
  'salt nic',
  'ซอลท์',
  'ซอลนิค'
]) AS keyword
ON CONFLICT DO NOTHING;

INSERT INTO category_keywords (category_id, keyword)
SELECT 'freebase', keyword
FROM UNNEST(ARRAY[
  'freebase',
  'free base',
  'ฟรีเบส'
]) AS keyword
ON CONFLICT DO NOTHING;

INSERT INTO category_keywords (category_id, keyword)
SELECT 'coil-atom', keyword
FROM UNNEST(ARRAY[
  'coil',
  'คอยล์',
  'atom',
  'อะตอม',
  'rda',
  'rta',
  'rdta',
  'battlestar baby cartridge',
  'bmor fuse cartridge',
  'caliburn a2s cartridge',
  'freemax onnix cartridge',
  'lost vape ursa mini empty cartridge',
  'jellybox f cartridge',
  'oxva origin x cartridge',
  'jellybox z cartridge',
  'pnp x cartridge dtl',
  'pnp x cartridge mtl',
  'rincoe jellybox nano cartridge',
  'smoant charon baby plus cartridge',
  'smoant santi cartridge',
  'smok g-priv empty cartridge',
  'smok nexmesh cartridge',
  'smok nfix replacement cartridge',
  'smok nord 2 cartridge',
  'smok nord 50w cartridge',
  'smok nord replacement cartridge',
  'smok nord x cartridge',
  'smok rpm nord',
  'smok scar p5 cartridge',
  'smok stick r22 cartridge',
  'tank smok rpm 85',
  'tank smok rpm 100',
  'uwell caliburn a2 cartridge',
  'uwell caliburn g cartridge',
  'uwell caliburn koko cartridge',
  'uwell havok v1 cartridge',
  'vandyvape jackaroo cartridge',
  'vaporesso luxe pm40 cartridge',
  'vaporesso xiron cartridge',
  'voopoo pnp',
  'voopoo tpp cartridge',
  'voopoo tpp-x cartridge',
  'voopoo vinci 2 replacement cartridge',
  'voopoo vinci cartridge',
  'voopoo vinci v2 cartridge',
  'voopoo vmate cartridge v2',
  'nevoks feelin x cartridge',
  'cartridge uwell caliburn pod',
  'freemax autopod50 pod cartridge',
  'ito-x pod',
  'ijoy aria opod cartridge',
  'jellybox xs empty pod cartridge',
  'lost vape orion mini replacement pods',
  'lost vape ursa nano pro empty pod cartridge',
  'nevoks หัวแทงค์ feelin mini empty pod',
  'rincoe jellybox air x pod cartridge',
  'rincoe jellybox v pod cartridge',
  'rincoe manto nano pod cartridge',
  'smok acro dc cartridge',
  'smok mag empty pod',
  'smok rpm 5',
  'smok solus 2 mesh',
  'uwell caliburn g2 pod cartridge',
  'uwell caliburn x empty pod cartridge',
  'uwell popreel p1 replacement pods',
  'vandyvape jackaroo pod rba cartridge',
  'vaporesso zero 2 pod cartridge',
  'vladdin jet pod cartridge',
  'voopoo pnp pod ii',
  'voopoo pod rta',
  'smok rpm 2 empty pod cartridge',
  'smok nfix pro pod cartridge',
  'smok nord replacement pod cartridge',
  'smok rpm 25 empty lp1 pod cartridge',
  'smok morph',
  'หัวพอต voopoo argus p1 empty cartridge',
  'caliburn a3s refillable pod',
  'หัวพอต vinci 3 empty cartridge'
]) AS keyword
ON CONFLICT DO NOTHING;

INSERT INTO category_keywords (category_id, keyword)
SELECT 'accessory', keyword
FROM UNNEST(ARRAY[
  'battery',
  'ถ่าน',
  'charger',
  'ชาร์จ',
  'สาย',
  'สายคล้องพอต',
  'case',
  'silicone case เคส infy พร้อมสายคล้องคอ',
  'accessory',
  'อุปกรณ์'
]) AS keyword
ON CONFLICT DO NOTHING;
