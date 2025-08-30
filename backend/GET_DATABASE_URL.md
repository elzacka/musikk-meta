# 🔑 How to Get Your Database URL

Your music data is stored in a Neon PostgreSQL database. To export it, you need the database URL.

## 📍 Option 1: From Neon Dashboard (Recommended)

1. **Go to Neon Console**: https://console.neon.tech/
2. **Select your project**: `icy-shadow-35990487`
3. **Go to Dashboard** → **Connection Details**
4. **Copy the connection string** that looks like:
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb
   ```

## 📍 Option 2: From Databutton (if you still have access)

1. Go to your Databutton project
2. Click on **Secrets** in the sidebar
3. Look for: `DATABASE_URL_DEV` or `DATABASE_URL_ADMIN_DEV`
4. Copy the value

## 🚀 How to Use the Database URL

Once you have the URL, run the export:

### Method 1: Environment Variable
```bash
export DATABASE_URL="postgresql://username:password@host:port/database"
python3 export_simple.py
```

### Method 2: Command Line
```bash
python3 export_simple.py "postgresql://username:password@host:port/database"
```

### Method 3: Config File
```bash
echo "postgresql://username:password@host:port/database" > database_url.txt
python3 export_simple.py
```

## 🔍 What the URL Looks Like

Format: `postgresql://username:password@hostname:port/database`

Example: `postgresql://user123:abc456@ep-cool-math-123456.us-east-1.aws.neon.tech:5432/neondb`

- **username**: Your database user
- **password**: Your database password  
- **hostname**: Neon endpoint (usually starts with `ep-`)
- **port**: Usually `5432`
- **database**: Usually `neondb`

## ⚠️ Security Note

- Keep your database URL private
- Don't commit it to git
- Don't share it in screenshots

## 🆘 Need Help?

If you can't find the database URL:

1. **Check Neon Console** - Most reliable source
2. **Check Databutton project** - Look in secrets/environment
3. **Contact Neon support** - They can help recover access

The database contains your `tracks_new` table with all the music metadata!