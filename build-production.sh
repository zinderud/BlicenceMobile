# Production Build Script for Blicence Mobile
# This script prepares the app for production deployment

#!/bin/bash

echo "🚀 Starting Blicence Mobile Production Build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Exit on any error
set -e

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if app.json exists
if [ ! -f "app.json" ]; then
    print_error "app.json not found. This doesn't appear to be a React Native project."
    exit 1
fi

print_status "Project validation passed ✓"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf android/app/build
rm -rf ios/build
rm -rf node_modules/.cache

# Install dependencies
print_status "Installing dependencies..."
npm ci --legacy-peer-deps

# Run TypeScript checks
print_status "Running TypeScript checks..."
if ! npx tsc --noEmit; then
    print_error "TypeScript compilation failed. Please fix the errors before building."
    exit 1
fi

print_status "TypeScript checks passed ✓"

# Run tests
print_status "Running tests..."
if ! npm test -- --watchAll=false --coverage=false; then
    print_warning "Some tests failed. Consider fixing them before production deployment."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_status "Tests completed ✓"

# Run linting
print_status "Running linting..."
if ! npm run lint; then
    print_warning "Linting issues found. Consider fixing them for better code quality."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_status "Linting completed ✓"

# Set production environment
print_status "Setting production environment..."
export NODE_ENV=production
export ENVFILE=.env.production

# Create production environment file if it doesn't exist
if [ ! -f ".env.production" ]; then
    print_status "Creating production environment file..."
    cat > .env.production << EOF
NODE_ENV=production
API_BASE_URL=https://api.blicence.com
BLOCKCHAIN_NETWORK=mainnet
ENABLE_LOGGING=false
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
EOF
fi

# Android Build
print_status "Building Android APK..."
cd android

print_status "Cleaning Android build..."
./gradlew clean

print_status "Building release APK..."
if ! ./gradlew assembleRelease; then
    print_error "Android build failed!"
    exit 1
fi

print_status "Android APK built successfully ✓"
print_status "APK location: android/app/build/outputs/apk/release/app-release.apk"

# Generate Android Bundle for Google Play
print_status "Building Android App Bundle (AAB)..."
if ! ./gradlew bundleRelease; then
    print_error "Android Bundle build failed!"
    exit 1
fi

print_status "Android Bundle built successfully ✓"
print_status "AAB location: android/app/build/outputs/bundle/release/app-release.aab"

cd ..

# iOS Build (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    print_status "Building iOS archive..."
    cd ios
    
    print_status "Installing iOS dependencies..."
    pod install
    
    print_status "Building iOS archive..."
    xcodebuild -workspace BlicenceMobile.xcworkspace \
               -scheme BlicenceMobile \
               -configuration Release \
               -archivePath BlicenceMobile.xcarchive \
               archive
    
    print_status "Exporting iOS IPA..."
    xcodebuild -exportArchive \
               -archivePath BlicenceMobile.xcarchive \
               -exportOptionsPlist exportOptions.plist \
               -exportPath ./build
    
    print_status "iOS build completed ✓"
    print_status "IPA location: ios/build/BlicenceMobile.ipa"
    
    cd ..
else
    print_warning "iOS build skipped (not running on macOS)"
fi

# Generate build information
print_status "Generating build information..."
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BUILD_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

cat > build-info.json << EOF
{
  "buildDate": "$BUILD_DATE",
  "gitHash": "$BUILD_HASH",
  "gitBranch": "$BUILD_BRANCH",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "platform": "$(uname -s)",
  "architecture": "$(uname -m)"
}
EOF

print_status "Build information saved to build-info.json"

# Create deployment package
print_status "Creating deployment package..."
mkdir -p deployment

# Copy APK
if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    cp android/app/build/outputs/apk/release/app-release.apk deployment/blicence-mobile-release.apk
fi

# Copy AAB
if [ -f "android/app/build/outputs/bundle/release/app-release.aab" ]; then
    cp android/app/build/outputs/bundle/release/app-release.aab deployment/blicence-mobile-release.aab
fi

# Copy iOS IPA if exists
if [ -f "ios/build/BlicenceMobile.ipa" ]; then
    cp ios/build/BlicenceMobile.ipa deployment/blicence-mobile-release.ipa
fi

# Copy build info
cp build-info.json deployment/

# Create checksums
print_status "Generating checksums..."
cd deployment
for file in *.apk *.aab *.ipa; do
    if [ -f "$file" ]; then
        sha256sum "$file" > "$file.sha256"
    fi
done
cd ..

# Generate deployment notes
print_status "Generating deployment notes..."
cat > deployment/DEPLOYMENT_NOTES.md << EOF
# Blicence Mobile - Production Build

## Build Information
- **Build Date**: $BUILD_DATE
- **Git Hash**: $BUILD_HASH
- **Git Branch**: $BUILD_BRANCH
- **Node Version**: $(node --version)
- **React Native Version**: $(grep '"react-native"' package.json | sed 's/.*: "\(.*\)".*/\1/')

## Build Artifacts
$(ls -la deployment/ | grep -E '\.(apk|aab|ipa)$' | awk '{print "- " $9 " (" $5 " bytes)"}')

## Deployment Checklist
- [ ] APK/AAB signed with production keystore
- [ ] iOS app signed with distribution certificate
- [ ] All environment variables set correctly
- [ ] API endpoints pointing to production
- [ ] Analytics and crash reporting enabled
- [ ] Performance monitoring active
- [ ] Security features enabled

## Post-Deployment Steps
1. Upload to respective app stores
2. Monitor crash reports and analytics
3. Test critical user flows
4. Monitor performance metrics
5. Update deployment documentation

## Rollback Plan
- Keep previous version available for quick rollback
- Monitor user feedback and crash reports
- Have hotfix deployment process ready

## Support
- Development Team: dev@blicence.com
- DevOps Team: devops@blicence.com
- Product Team: product@blicence.com
EOF

print_status "Deployment package created in ./deployment/ directory"

# Final summary
echo
echo "🎉 Production build completed successfully!"
echo
echo "📦 Build Artifacts:"
ls -la deployment/ | grep -E '\.(apk|aab|ipa)$'
echo
echo "📋 Next Steps:"
echo "1. Review deployment/DEPLOYMENT_NOTES.md"
echo "2. Test the build artifacts on real devices"
echo "3. Upload to app stores"
echo "4. Monitor deployment metrics"
echo
print_status "Build process completed successfully! 🚀"
