for file in src/network/*.ts src/data/*.ts src/validation/*.ts src/parsing/*.ts src/async/*.ts src/security/*.ts src/utils/*.ts src/observability/*.ts src/adapters/*.ts; do
  if [ "$(basename "$file")" != "index.ts" ]; then
    name=$(basename "$file" .ts)
    Name=$(echo "$name" | sed 's/^./\U&/')
    echo "export class $Name {}
export const create$Name = () => new $Name();" > "$file"
  fi
done
