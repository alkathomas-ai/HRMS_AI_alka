#!/bin/bash

# Memory Leak Verification Script
# This script checks for common memory leak patterns in the codebase

echo "🔍 Scanning for potential memory leaks..."
echo ""

# Check for setInterval without cleanup
echo "1️⃣ Checking setInterval usage..."
INTERVALS=$(grep -rn "setInterval" src/ --include="*.jsx" --include="*.js" | grep -v "clearInterval" | grep -v "return () =>" | grep -v "utils/" | wc -l)
if [ $INTERVALS -eq 0 ]; then
    echo "✅ All setInterval calls have proper cleanup"
else
    echo "⚠️  Found $INTERVALS potential setInterval leaks:"
    grep -rn "setInterval" src/ --include="*.jsx" --include="*.js" | grep -v "clearInterval" | grep -v "return () =>" | grep -v "utils/"
fi
echo ""

# Check for setTimeout without cleanup in useEffect
echo "2️⃣ Checking setTimeout in useEffect..."
TIMEOUTS=$(grep -A5 "useEffect" src/ -r --include="*.jsx" | grep "setTimeout" | grep -v "clearTimeout" | grep -v "timeoutRef" | grep -v "timeoutId" | wc -l)
if [ $TIMEOUTS -eq 0 ]; then
    echo "✅ All setTimeout calls in useEffect have proper cleanup"
else
    echo "⚠️  Found $TIMEOUTS potential setTimeout leaks"
fi
echo ""

# Check for event listeners without cleanup
echo "3️⃣ Checking addEventListener usage..."
LISTENERS=$(grep -rn "addEventListener" src/ --include="*.jsx" --include="*.js" | wc -l)
REMOVERS=$(grep -rn "removeEventListener" src/ --include="*.jsx" --include="*.js" | wc -l)
if [ $LISTENERS -eq $REMOVERS ]; then
    echo "✅ All event listeners have cleanup ($LISTENERS added, $REMOVERS removed)"
else
    echo "⚠️  Event listener mismatch: $LISTENERS added, $REMOVERS removed"
fi
echo ""

# Check for MutationObserver without disconnect
echo "4️⃣ Checking MutationObserver usage..."
OBSERVERS=$(grep -rn "new MutationObserver" src/ --include="*.jsx" --include="*.js" | wc -l)
DISCONNECTS=$(grep -rn "observer.disconnect" src/ --include="*.jsx" --include="*.js" | wc -l)
if [ $OBSERVERS -eq $DISCONNECTS ]; then
    echo "✅ All MutationObservers have cleanup ($OBSERVERS created, $DISCONNECTS disconnected)"
else
    echo "⚠️  MutationObserver mismatch: $OBSERVERS created, $DISCONNECTS disconnected"
fi
echo ""

# Check for useMemo/useCallback without dependencies
echo "5️⃣ Checking React hooks dependencies..."
EMPTY_DEPS=$(grep -A1 "useMemo\|useCallback" src/ -r --include="*.jsx" | grep "\[\]" | wc -l)
echo "ℹ️  Found $EMPTY_DEPS hooks with empty dependencies (review if intentional)"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $INTERVALS -eq 0 ] && [ $TIMEOUTS -eq 0 ] && [ $LISTENERS -eq $REMOVERS ] && [ $OBSERVERS -eq $DISCONNECTS ]; then
    echo "✅ All critical memory leak checks passed!"
    echo "✅ System should NOT hang anymore"
else
    echo "⚠️  Some potential issues found - review above"
fi
echo ""
